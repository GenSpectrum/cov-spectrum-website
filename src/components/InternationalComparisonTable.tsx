import { sortBy } from 'lodash';
import React, { useMemo } from 'react';
import { Button, Table } from 'react-bootstrap';
import { LazySampleButton } from '../components/LazySampleButton';
import { globalDateCache, UnifiedIsoWeek } from '../helpers/date-cache';
import { SampleSet } from '../helpers/sample-set';
import { AccountService } from '../services/AccountService';
import { DateRange, SamplingStrategy, toLiteralSamplingStrategy } from '../services/api';
import { Variant } from '../services/api-types';
import { NextcladeService } from '../services/NextcladeService';

interface Props {
  dateRange: DateRange;
  matchPercentage: number;
  variant: Variant;
  variantInternationalSampleSet: SampleSet;
}

interface CountrySummary {
  country: string;
  count: number;
  weekRange: { min: UnifiedIsoWeek; max: UnifiedIsoWeek };
}

export const InternationalComparisonTable = ({
  dateRange,
  matchPercentage,
  variant,
  variantInternationalSampleSet,
}: Props) => {
  const summaries = useMemo(() => {
    const summaries: CountrySummary[] = [];
    for (const [country, samples] of variantInternationalSampleSet.groupByField('country')) {
      const weekRange = globalDateCache.rangeFromWeeks(samples.map(s => s.date.isoWeek));
      if (!weekRange) {
        continue;
      }
      summaries.push({
        country,
        count: samples.reduce((total, sample) => total + sample.count, 0),
        weekRange,
      });
    }
    return sortBy(summaries, s => s.country);
  }, [variantInternationalSampleSet]);

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Country</th>
          <th>Total Variant Sequences</th>
          <th>First seq. found at</th>
          <th>Last seq. found at</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {summaries.map(c => (
          <tr key={c.country}>
            <td>{c.country}</td>
            <td>{c.count}</td>
            <td>{c.weekRange.min.yearWeekString}</td>
            <td>{c.weekRange.max.yearWeekString}</td>
            <td>
              {AccountService.isLoggedIn() && (
                <>
                  <Button
                    onClick={() =>
                      NextcladeService.showVariantOnNextclade({
                        variant,
                        matchPercentage,
                        country: c.country,
                        samplingStrategy: toLiteralSamplingStrategy(SamplingStrategy.AllSamples),
                      })
                    }
                    variant='secondary'
                    size='sm'
                    className='mr-2'
                  >
                    Show on Nextclade
                  </Button>
                  <LazySampleButton
                    query={{
                      variantSelector: { variant, matchPercentage },
                      country: c.country,
                      samplingStrategy: SamplingStrategy.AllSamples,
                      dateRange,
                    }}
                    variant='secondary'
                    size='sm'
                  >
                    Show samples
                  </LazySampleButton>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
