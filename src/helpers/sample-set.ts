import { MultiSample } from '../services/api-types';
import { NewSampleSelector } from '../helpers/sample-selector';

export class SampleSet<S extends NewSampleSelector | null = NewSampleSelector | null> {
  constructor(private data: Iterable<MultiSample>, public readonly sampleSelector: S) {}

  getAll(): Iterable<MultiSample> {
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
