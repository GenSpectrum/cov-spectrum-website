interface QueryValueEncoder<T> {
  _decodedType: T;
  encode(decoded: T): string[];
  decode(encoded: string[]): T;
}

export interface QueryEncoder<T> {
  _decodedType: T;
  encode(decoded: T): URLSearchParams;
  decode(encoded: URLSearchParams): T;
}

function getOnlyElement<T>(values: T[]): T {
  if (values.length !== 1) {
    throw new Error(`got ${values.length} values, want exactly 1`);
  }
  return values[0];
}

export class StringEncoder implements QueryValueEncoder<string> {
  _decodedType: string;

  encode(decoded: string): string[] {
    return [encodeURIComponent(decoded)];
  }

  decode(encoded: string[]): string {
    return decodeURIComponent(getOnlyElement(encoded));
  }
}

export class FiniteFloatEncoder implements QueryValueEncoder<number> {
  _decodedType: number;

  private static stringEncoder = new StringEncoder();

  private static assertFinite(v: number) {
    if (!Number.isFinite(v)) {
      throw new Error(`number was not finite: ${v}`);
    }
  }

  encode(decoded: number): string[] {
    FiniteFloatEncoder.assertFinite(decoded);
    return FiniteFloatEncoder.stringEncoder.encode(decoded.toString());
  }

  decode(encoded: string[]): number {
    const decoded = parseFloat(FiniteFloatEncoder.stringEncoder.decode(encoded));
    FiniteFloatEncoder.assertFinite(decoded);
    return decoded;
  }
}

export class CommaSeparatedArrayEncoder<T> implements QueryValueEncoder<T[]> {
  _decodedType: T[];

  constructor(private elementEncoder: QueryValueEncoder<T>) {}

  encode(decoded: T[]): string[] {
    const encodedElements = decoded.map(v => this.elementEncoder.encode(v));
    for (const encodedElement of encodedElements) {
      if (encodedElement.includes(',')) {
        throw new Error('encoded elements of a comma separated array must not include commas');
      }
    }
    return [encodedElements.join(',')];
  }

  decode(encoded: string[]): T[] {
    return getOnlyElement(encoded)
      .split(',')
      .map(v => this.elementEncoder.decode([v]));
  }
}

type FieldEncoders<T> = { [K in keyof T]: QueryValueEncoder<T[K]> };
type DecodedObject<E extends FieldEncoders<any>> = { [K in keyof E]: E[K]['_decodedType'] };
export class ObjectEncoder<E extends FieldEncoders<any>, T extends DecodedObject<E>>
  implements QueryEncoder<T> {
  _decodedType: T;

  constructor(private fieldEncoders: E) {}

  encode(decoded: T): URLSearchParams {
    const encoded = new URLSearchParams();
    for (const [key, decodedField] of Object.entries(decoded)) {
      const fieldEncoder: QueryValueEncoder<unknown> = this.fieldEncoders[key];
      fieldEncoder.encode(decodedField).forEach(v => encoded.append(key, v));
    }
    return encoded;
  }

  decode(encoded: URLSearchParams): T {
    const decoded: Partial<T> = {};
    for (const [key, fieldEncoder] of Object.entries(this.fieldEncoders)) {
      const encodedField = (fieldEncoder as QueryValueEncoder<unknown>).decode(encoded.getAll(key));
      decoded[key as keyof T] = encodedField as any;
    }
    return decoded as T;
  }
}

export const distributionConfigurationEncoder = new ObjectEncoder({
  country: new StringEncoder(),
  matchPercentage: new FiniteFloatEncoder(),
  mutations: new CommaSeparatedArrayEncoder(new StringEncoder()),
});

export type DistributionConfiguration = typeof distributionConfigurationEncoder['_decodedType'];
