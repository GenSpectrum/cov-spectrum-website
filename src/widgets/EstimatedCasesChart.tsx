import { UnifiedDay } from '../helpers/date-cache';
import { EstimatedCasesChartInner, EstimatedCasesTimeEntry } from './EstimatedCasesChartInner';
import { DateCountSampleDataset } from '../data/sample/DateCountSampleDataset';
import { fillAndFilterFromDailyMap } from '../helpers/fill-missing';
import { AsyncDataset } from '../data/AsyncDataset';
import { LocationDateSelector } from '../data/LocationDateSelector';
import Loader from '../components/Loader';
import { CaseCountEntry } from '../data/CaseCountEntry';

export type EstimatedCasesChartProps = {
  wholeDateCounts: DateCountSampleDataset;
  variantDateCounts: DateCountSampleDataset;
  caseCounts: AsyncDataset<LocationDateSelector, CaseCountEntry[]>;
};

export const EstimatedCasesChart = ({
  wholeDateCounts,
  variantDateCounts,
  caseCounts,
}: EstimatedCasesChartProps) => {
  if (!caseCounts.payload) {
    return <Loader />;
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
  return <EstimatedCasesChartInner data={new Array(...data.values())} />;
};
