import * as zod from 'zod';

export interface QueryEncoder<T> {
  _decodedType: T;
  encode(decoded: T): URLSearchParams;
  decode(encoded: URLSearchParams): T;
}

export class ZodQueryEncoder<S extends zod.ZodSchema<any>, T extends zod.input<S> & zod.output<S>> {
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
