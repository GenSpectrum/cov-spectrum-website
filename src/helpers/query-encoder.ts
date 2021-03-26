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
