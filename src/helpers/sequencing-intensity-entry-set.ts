import { SequencingIntensityEntry } from '../services/api-types';
import * as zod from 'zod';
import { LiteralSamplingStrategySchema } from '../services/api';

export const SequencingIntensityEntrySetSelectorSchema = zod.object({
  country: zod.string().optional(),
  samplingStrategy: LiteralSamplingStrategySchema,
});

export type SequencingIntensityEntrySet = { data: SequencingIntensityEntry[] };
export type SequencingIntensityEntrySetSelector = zod.infer<typeof SequencingIntensityEntrySetSelectorSchema>;
export type SequencingIntensityEntrySetWithSelector = SequencingIntensityEntrySet & {
  readonly selector: SequencingIntensityEntrySetSelector;
};
