import { RawMultiSample } from '../services/api-types';
import { NewSampleSelector } from '../helpers/sample-selector';
import { globalDateCache, UnifiedDay } from './date-cache';

export type ParsedMultiSample = Omit<RawMultiSample, 'date'> & { date: UnifiedDay };

export class SampleSet<S extends NewSampleSelector | null = NewSampleSelector | null> {
  constructor(private data: ParsedMultiSample[], public readonly sampleSelector: S) {}

  static fromRawSamples<S extends NewSampleSelector | null = NewSampleSelector | null>(
    data: RawMultiSample[],
    sampleSelector: S
  ): SampleSet<S> {
    return new SampleSet(
      data.map(s => ({ ...s, date: globalDateCache.getDay(s.date) })),
      sampleSelector
    );
  }

  getAll(): Iterable<ParsedMultiSample> {
    return this.data;
  }

  isEmpty(): boolean {
    for (const s of this.getAll()) {
      if (s.count) {
        return false;
      }
    }
    return true;
  }
}

export type SampleSetWithSelector = SampleSet & { readonly sampleSelector: NewSampleSelector };
