import { SequencingIntensityEntry } from '../services/api-types';
import * as zod from 'zod';
import { NewSampleSelector } from './sample-selector';

export const SequencingIntensityEntrySetSelectorSchema = zod.object({
  country: zod.string().optional(),
});

export type SequencingIntensityEntrySet = { data: SequencingIntensityEntry[] };
export type SequencingIntensityEntrySetSelector = zod.infer<typeof SequencingIntensityEntrySetSelectorSchema>;
export type SequencingIntensityEntrySetWithSelector = SequencingIntensityEntrySet & {
  readonly selector: NewSampleSelector;
};
