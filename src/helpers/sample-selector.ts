import { ObjectEncoder, StringEncoder, FiniteFloatEncoder, CommaSeparatedArrayEncoder } from './query';

export const sampleSelectorEncoder = new ObjectEncoder({
  country: new StringEncoder(),
  matchPercentage: new FiniteFloatEncoder(),
  mutations: new CommaSeparatedArrayEncoder(new StringEncoder()),
});

export type SampleSelector = typeof sampleSelectorEncoder['_decodedType'];
