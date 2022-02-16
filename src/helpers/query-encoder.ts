import * as zod from 'zod';

export interface QueryEncoder<T> {
  _decodedType: T;
  encode(decoded: T): URLSearchParams;
  decode(encoded: URLSearchParams): T;
}

export interface AsyncQueryEncoder<T> {
  _decodedType: T;
  encode(decoded: T): Promise<URLSearchParams>;
  decode(encoded: URLSearchParams, signal: AbortSignal | undefined): Promise<T>;
}

export class ZodQueryEncoder<S extends zod.ZodSchema<any>, T extends zod.input<S> & zod.output<S>>
  implements QueryEncoder<T> {
  _decodedType!: T;

  constructor(private schema: S, private searchParamsKey: string = 'json') {}

  encode(decoded: T): URLSearchParams {
    return new URLSearchParams({ [this.searchParamsKey]: JSON.stringify(this.schema.parse(decoded)) });
  }

  decode(encoded: URLSearchParams): T {
    const encodedFieldValues = encoded.getAll(this.searchParamsKey);
    if (encodedFieldValues.length !== 1) {
      throw new Error(
        `got ${encodedFieldValues.length} copies of searchParamsKey (${this.searchParamsKey}), expected exactly 1`
      );
    }
    return this.schema.parse(JSON.parse(encodedFieldValues[0]));
  }
}

//Convert data to URL search params for API requests, and vice-versa
export class AsyncZodQueryEncoder<
  ExternalType,
  Schema extends zod.ZodSchema<any>,
  InternalType extends zod.infer<Schema>
> implements AsyncQueryEncoder<ExternalType> {
  _decodedType!: ExternalType;
  private zodQueryEncoder: ZodQueryEncoder<Schema, InternalType>;

  constructor(
    schema: Schema,
    private encodeToInternal: (decoded: ExternalType) => Promise<InternalType>,
    private decodeFromInternal: (encoded: InternalType, signal?: AbortSignal) => Promise<ExternalType>,
    searchParamsKey: string = 'json'
  ) {
    this.zodQueryEncoder = new ZodQueryEncoder(schema, searchParamsKey);
  }

  async encode(decoded: ExternalType): Promise<URLSearchParams> {
    return this.zodQueryEncoder.encode(await this.encodeToInternal(decoded));
  }

  async decode(encoded: URLSearchParams): Promise<ExternalType> {
    return this.decodeFromInternal(this.zodQueryEncoder.decode(encoded));
  }
}

type MergedDecodedType<Encoders extends { [key: string]: AsyncQueryEncoder<any> }> = {
  [K in keyof Encoders]: Encoders[K]['_decodedType'];
};

export class MergedAsyncQueryEncoder<Encoders extends { [key: string]: AsyncQueryEncoder<any> }> {
  _decodedType!: MergedDecodedType<Encoders>;

  constructor(private encoders: Encoders) {}

  async encode(decoded: MergedDecodedType<Encoders>): Promise<URLSearchParams> {
    const separateParams = await Promise.all(
      Object.entries(this.encoders).map(([k, encoder]) => encoder.encode(decoded[k]))
    );
    return new URLSearchParams(Object.assign({}, ...separateParams.map(p => Object.fromEntries(p))));
  }

  async decode(
    encoded: URLSearchParams,
    signal: AbortSignal | undefined
  ): Promise<MergedDecodedType<Encoders>> {
    const mergedDecoded: Partial<MergedDecodedType<Encoders>> = {};
    for (const [k, encoder] of Object.entries(this.encoders)) {
      mergedDecoded[k as keyof Encoders] = await encoder.decode(encoded, signal);
    }
    return mergedDecoded as MergedDecodedType<Encoders>;
  }
}
