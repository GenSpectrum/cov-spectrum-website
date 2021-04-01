import { NewSampleSelector } from '../helpers/sample-selector';
import { RawMultiSample } from '../services/api-types';
import { globalDateCache, UnifiedDay, UnifiedIsoWeek } from './date-cache';

export type ParsedMultiSample = Omit<RawMultiSample, 'date'> & { date: UnifiedDay };

type CountableMultiSampleField = keyof Omit<ParsedMultiSample, 'date' | 'count'>;

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

  countByField<F extends CountableMultiSampleField>(
    field: F
  ): { key: ParsedMultiSample[F]; count: number }[] {
    return [...this.countByFieldAsMap(field).entries()].map(([k, v]) => ({ key: k, count: v }));
  }

  countByWeek(): { isoWeek: UnifiedIsoWeek; count: number }[] {
    return [...this.countByWeekAsMap().entries()].map(([k, v]) => ({ isoWeek: k, count: v }));
  }

  // proportionByField gives similar output to countByField, but also gives the
  // proportion of samples from this set relative to some other "whole" set
  // WARNING If there is a week in "whole" but not in "this", it will not be returned.
  // If there is a week in "this" but not in "whole", proportion will be undefined.
  proportionByField<F extends CountableMultiSampleField>(
    field: F,
    whole: SampleSet
  ): { key: ParsedMultiSample[F]; count: number; proportion?: number }[] {
    const wholeCounts = whole.countByFieldAsMap(field);
    return [...this.countByFieldAsMap(field).entries()].map(([k, v]) => {
      const wholeCount = wholeCounts.get(k);
      return {
        key: k,
        count: v,
        proportion: wholeCount === undefined ? undefined : v / wholeCount,
      };
    });
  }

  // see documentation and warnings for proportionByField
  proportionByWeek(whole: SampleSet): { isoWeek: UnifiedIsoWeek; count: number; proportion?: number }[] {
    const wholeCounts = whole.countByWeekAsMap();
    return [...this.countByWeekAsMap().entries()].map(([k, v]) => {
      const wholeCount = wholeCounts.get(k);
      return {
        isoWeek: k,
        count: v,
        proportion: wholeCount === undefined ? undefined : v / wholeCount,
      };
    });
  }

  countByFieldAsMap<F extends CountableMultiSampleField>(field: F): Map<ParsedMultiSample[F], number> {
    const output = new Map<ParsedMultiSample[F], number>();
    for (const multiSample of this.data) {
      const oldCount = output.get(multiSample[field]) ?? 0;
      output.set(multiSample[field], oldCount + multiSample.count);
    }
    return output;
  }

  countByWeekAsMap(): Map<UnifiedIsoWeek, number> {
    const output = new Map<UnifiedIsoWeek, number>();
    for (const multiSample of this.data) {
      const oldCount = output.get(multiSample.date.isoWeek) ?? 0;
      output.set(multiSample.date.isoWeek, oldCount + multiSample.count);
    }
    return output;
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
