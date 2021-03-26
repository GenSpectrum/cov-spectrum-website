import { RawMultiSample } from '../services/api-types';
import { NewSampleSelector } from '../helpers/sample-selector';
import { globalDateCache, UnifiedDay, UnifiedIsoWeek } from './date-cache';
import { groupBy } from 'lodash';

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

  groupByWeek(): { isoWeek: UnifiedIsoWeek; samples: ParsedMultiSample[] }[] {
    return Object.entries(this.groupByWeekAsObject()).map(([k, g]) => ({
      isoWeek: g[0].date.isoWeek,
      samples: g,
    }));
  }

  // groupByWeekWithOther gives the same output as groupByWeek, but attaches
  // grouped samples from another sample set to each entry.
  // WARNING If there is a week in "other" but not in "this", it will not be returned.
  groupByWeekWithOther(
    other: SampleSet
  ): { isoWeek: UnifiedIsoWeek; samples: ParsedMultiSample[]; otherSamples: ParsedMultiSample[] }[] {
    const groupedOther = other.groupByWeekAsObject();
    return Object.entries(this.groupByWeekAsObject()).map(([k, g]) => {
      return {
        isoWeek: g[0].date.isoWeek,
        samples: g,
        otherSamples: groupedOther[k] || [],
      };
    });
  }

  private groupByWeekAsObject(): { [yearWeek: string]: ParsedMultiSample[] } {
    return groupBy(this.data, s => s.date.isoWeek.yearWeekString);
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
