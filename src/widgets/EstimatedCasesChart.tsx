import { UnifiedDay } from '../helpers/date-cache';
import { EstimatedCasesChartInner, EstimatedCasesTimeEntry } from './EstimatedCasesChartInner';
import { DateCountSampleDataset } from '../data/sample/DateCountSampleDataset';
import { fillAndFilterFromDailyMap } from '../helpers/fill-missing';
import Loader from '../components/Loader';
import { CaseCountAsyncDataset } from '../data/CaseCountDataset';
import { useMemo } from 'react';

export type EstimatedCasesChartProps = {
  wholeDateCounts: DateCountSampleDataset;
  variantDateCounts: DateCountSampleDataset;
  caseCounts: CaseCountAsyncDataset;
};

export const EstimatedCasesChart = ({
  wholeDateCounts,
  variantDateCounts,
  caseCounts,
}: EstimatedCasesChartProps) => {
  const data = useMemo(
    () => prepareData(variantDateCounts, wholeDateCounts, caseCounts),
    [caseCounts, variantDateCounts, wholeDateCounts]
  );
  if (!data) {
    return <Loader />;
  }
  return <EstimatedCasesChartInner data={new Array(...data.values())} />;
};

export function prepareData(
  variantDateCounts: DateCountSampleDataset,
  wholeDateCounts: DateCountSampleDataset,
  caseCounts: CaseCountAsyncDataset
) {
  if (!caseCounts.payload) {
    return undefined;
  }
  const data: Map<UnifiedDay, EstimatedCasesTimeEntry> = new Map();
  fillAndFilterFromDailyMap(
    new Map<UnifiedDay, Omit<EstimatedCasesTimeEntry, 'date'>>(),
    {
      cases: 0,
      sequenced: 0,
      variantCount: 0,
    },
    variantDateCounts.selector.dateRange!.getDateRange()
  ).forEach(({ key, value }) => data.set(key, { ...value, date: key }));
  for (let { date, count } of wholeDateCounts.payload) {
    if (!date || !data.has(date)) {
      continue;
    }
    data.get(date)!.sequenced += count;
  }
  for (let { date, count } of variantDateCounts.payload) {
    if (!date || !data.has(date)) {
      continue;
    }
    data.get(date)!.variantCount += count;
  }
  for (let { date, newCases } of caseCounts.payload) {
    if (!date || !data.has(date)) {
      continue;
    }
    data.get(date)!.cases += newCases;
  }
  return data;
}
