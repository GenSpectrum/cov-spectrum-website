import React, { useMemo, useState } from 'react';
import { Table } from 'react-bootstrap';
import { globalDateCache, UnifiedIsoWeek } from '../helpers/date-cache';
import { CountryDateCountSampleDataset } from '../data/sample/CountryDateCountSampleDataset';
import { Utils } from '../services/Utils';
import styled from 'styled-components';

interface Props {
  variantInternationalDateCountDataset: CountryDateCountSampleDataset;
}

interface CountrySummary {
  country: string;
  count: number;
  weekRange: { min: UnifiedIsoWeek; max: UnifiedIsoWeek };
}

const sortOptions = ['country', 'total', 'first', 'last'] as const;
type SortOptions = typeof sortOptions[number];

const sortInternationalComparison = (
  entries: CountrySummary[],
  sortOption: SortOptions,
  ifAscendic: boolean
): CountrySummary[] => {
  switch (sortOption) {
    case 'country':
      return ifAscendic
        ? entries.sort((a, b) => (a.country > b.country ? 1 : b.country > a.country ? -1 : 0))
        : entries.sort((a, b) => (b.country > a.country ? 1 : a.country > b.country ? -1 : 0));
    case 'total':
      return ifAscendic
        ? entries.sort((a, b) => a.count - b.count)
        : entries.sort((a, b) => b.count - a.count);
    case 'first':
      return ifAscendic
        ? entries.sort(
            (a, b) =>
              a.weekRange.min.isoYear - b.weekRange.min.isoYear ||
              a.weekRange.min.isoWeek - b.weekRange.min.isoWeek
          )
        : entries.sort(
            (a, b) =>
              b.weekRange.min.isoYear - a.weekRange.min.isoYear ||
              b.weekRange.min.isoWeek - a.weekRange.min.isoWeek
          );
    case 'last':
      return ifAscendic
        ? entries.sort(
            (a, b) =>
              a.weekRange.max.isoYear - b.weekRange.max.isoYear ||
              a.weekRange.max.isoWeek - b.weekRange.max.isoWeek
          )
        : entries.sort(
            (a, b) =>
              b.weekRange.max.isoYear - a.weekRange.max.isoYear ||
              b.weekRange.max.isoWeek - a.weekRange.max.isoWeek
          );
  }
};

export const InternationalComparisonTable = ({ variantInternationalDateCountDataset }: Props) => {
  const [sortOption, setSortOption] = useState<SortOptions>('country');
  const [ifAscending, setIfAscending] = useState<boolean>(true);
  const [ifAscTotal, setIfAscTotal] = useState<boolean>(true);
  const [ifAscFirst, setIfAscFirst] = useState<boolean>(true);
  const [ifAscLast, setIfAscLast] = useState<boolean>(true);
  const [ifAscCountry, setIfAscCountry] = useState<boolean>(false);

  const summaries = useMemo(() => {
    const summaries: CountrySummary[] = [];
    for (let [country, samples] of Utils.groupBy(
      variantInternationalDateCountDataset.payload,
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
    return summaries; //  return sortInternationalComparison(summaries, sortOption, ifAscending);
  }, [variantInternationalDateCountDataset]); // [variantInternationalDateCountDataset, ifAscending, sortOption]);

  let sortedData = sortInternationalComparison(summaries, sortOption, ifAscending);

  function handleClick(target: string): void {
    switch (target) {
      case 'country':
        setSortOption('country');
        setIfAscCountry(!ifAscCountry);
        setIfAscending(ifAscCountry);
        sortedData = sortInternationalComparison(summaries, 'country', ifAscending);
        break;
      case 'total':
        setSortOption('total');
        setIfAscTotal(!ifAscTotal);
        setIfAscending(ifAscTotal);
        sortedData = sortInternationalComparison(summaries, 'total', ifAscending);
        break;
      case 'first':
        setSortOption('first');
        setIfAscFirst(!ifAscFirst);
        setIfAscending(ifAscFirst);
        sortedData = sortInternationalComparison(summaries, 'first', ifAscending);
        break;
      case 'last':
        setSortOption('last');
        setIfAscLast(!ifAscLast);
        setIfAscending(ifAscLast);
        sortedData = sortInternationalComparison(summaries, 'last', ifAscending);
    }
  }

  const TableHeader = styled.th`
    font-weight: bolder;
    margin-top: 10px;
    &:hover,
    &:focus {
      color: #0276fd;
      cursor: pointer;
    }
  `;

  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <TableHeader
            onClick={() => {
              handleClick('country');
            }}
          >
            Country
          </TableHeader>
          <TableHeader
            onClick={() => {
              handleClick('total');
            }}
          >
            {' '}
            Total Variant Sequences
          </TableHeader>
          <TableHeader
            onClick={() => {
              handleClick('first');
            }}
          >
            First seq. found at
          </TableHeader>
          <TableHeader
            onClick={() => {
              handleClick('last');
            }}
          >
            Last seq. found at
          </TableHeader>
        </tr>
      </thead>
      <tbody>
        {sortedData.map(c => (
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
