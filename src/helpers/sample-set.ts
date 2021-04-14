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

  // proportionByField gives similar output to countByField, but also gives the
  // proportion of samples from this set relative to some other "whole" set
  // WARNING If there is a week in "whole" but not in "this", it will not be returned.
  // If there is a week in "this" but not in "whole", proportion will be undefined.
  proportionByField<F extends CountableMultiSampleField>(
    field: F,
    whole: SampleSet
  ): Map<ParsedMultiSample[F], { count: number; proportion?: number }> {
    const wholeCounts = whole.countByField(field);
    return new Map(
      [...this.countByField(field).entries()].map(([k, v]) => {
        const wholeCount = wholeCounts.get(k);
        return [
          k,
          {
            count: v,
            proportion: wholeCount === undefined ? undefined : v / wholeCount,
          },
        ];
      })
    );
  }

  // see documentation and warnings for proportionByField
  proportionByWeek(whole: SampleSet): Map<UnifiedIsoWeek, { count: number; proportion?: number }> {
    const wholeCounts = whole.countByWeek();
    return new Map(
      [...this.countByWeek().entries()].map(([k, v]) => {
        const wholeCount = wholeCounts.get(k);
        return [
          k,
          {
            count: v,
            proportion: wholeCount === undefined ? undefined : v / wholeCount,
          },
        ];
      })
    );
  }

  countByField<F extends CountableMultiSampleField>(field: F): Map<ParsedMultiSample[F], number> {
    const output = new Map<ParsedMultiSample[F], number>();
    for (const multiSample of this.data) {
      const oldCount = output.get(multiSample[field]) ?? 0;
      output.set(multiSample[field], oldCount + multiSample.count);
    }
    return output;
  }

  countByWeek(): Map<UnifiedIsoWeek, number> {
    const output = new Map<UnifiedIsoWeek, number>();
    for (const multiSample of this.data) {
      const oldCount = output.get(multiSample.date.isoWeek) ?? 0;
      output.set(multiSample.date.isoWeek, oldCount + multiSample.count);
    }
    return output;
  }

  groupByField<F extends CountableMultiSampleField>(
    field: F
  ): Map<ParsedMultiSample[F], ParsedMultiSample[]> {
    const output = new Map<ParsedMultiSample[F], ParsedMultiSample[]>();
    for (const multiSample of this.data) {
      let group = output.get(multiSample[field]);
      if (!group) {
        group = [];
        output.set(multiSample[field], group);
      }
      group.push(multiSample);
    }
    return output;
  }

  groupByWeek(): Map<UnifiedIsoWeek, ParsedMultiSample[]> {
    const output = new Map<UnifiedIsoWeek, ParsedMultiSample[]>();
    for (const multiSample of this.data) {
      let group = output.get(multiSample.date.isoWeek);
      if (!group) {
        group = [];
        output.set(multiSample.date.isoWeek, group);
      }
      group.push(multiSample);
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
