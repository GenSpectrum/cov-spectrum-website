import React, { useMemo } from 'react';
import { Table } from 'react-bootstrap';
import { globalDateCache, UnifiedIsoWeek } from '../helpers/date-cache';
import { CountryDateCountSampleDataset } from '../data/sample/CountryDateCountSampleDataset';
import { Utils } from '../services/Utils';

interface Props {
  variantInternationalDateCountDataset: CountryDateCountSampleDataset;
}

interface CountrySummary {
  country: string;
  count: number;
  weekRange: { min: UnifiedIsoWeek; max: UnifiedIsoWeek };
}

export const InternationalComparisonTable = ({ variantInternationalDateCountDataset }: Props) => {
  const summaries = useMemo(() => {
    const summaries: CountrySummary[] = [];
    for (let [country, samples] of Utils.groupBy(
      variantInternationalDateCountDataset.getPayload(),
      e => e.country
    )) {
      if (!country) {
        continue;
      }
      const weeks = samples.map(s => s.date?.isoWeek).filter(d => d !== undefined) as UnifiedIsoWeek[];
      const weekRange = globalDateCache.rangeFromWeeks(weeks);
      if (!weekRange) {
        continue;
      }
      summaries.push({
        country,
        count: samples.reduce((total, sample) => total + sample.count, 0),
        weekRange,
      });
    }
    return summaries;
  }, [variantInternationalDateCountDataset]);

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Country</th>
          <th>Total Variant Sequences</th>
          <th>First seq. found at</th>
          <th>Last seq. found at</th>
        </tr>
      </thead>
      <tbody>
        {summaries.map(c => (
          <tr key={c.country}>
            <td>{c.country}</td>
            <td>{c.count}</td>
            <td>{c.weekRange.min.yearWeekString}</td>
            <td>{c.weekRange.max.yearWeekString}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
