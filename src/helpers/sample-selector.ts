import { CountrySchema } from '../services/api-types';
import * as zod from 'zod';

export const SampleSelectorSchema = zod.object({
  country: CountrySchema,
  matchPercentage: zod.number(),
  mutations: zod.array(zod.string()),
});
