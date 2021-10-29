import { UnifiedDay } from '../helpers/date-cache';
import { EstimatedCasesChartInner, EstimatedCasesTimeEntry } from './EstimatedCasesChartInner';
import { DateCountSampleDataset } from '../data/sample/DateCountSampleDataset';
import { CaseCountDataset } from '../data/CaseCountDataset';
import { fillAndFilterFromDailyMap } from '../helpers/fill-missing';

export type EstimatedCasesChartProps = {
  wholeDateCounts: DateCountSampleDataset;
  variantDateCounts: DateCountSampleDataset;
  caseCounts: CaseCountDataset;
};

export const EstimatedCasesChart = ({
  wholeDateCounts,
  variantDateCounts,
  caseCounts,
}: EstimatedCasesChartProps) => {
  const data: Map<UnifiedDay, EstimatedCasesTimeEntry> = new Map();
  fillAndFilterFromDailyMap(
    new Map<UnifiedDay, Omit<EstimatedCasesTimeEntry, 'date'>>(),
    {
      cases: 0,
      sequenced: 0,
      variantCount: 0,
    },
    variantDateCounts.getSelector().dateRange!.getDateRange()
  ).forEach(({ key, value }) => data.set(key, { ...value, date: key }));
  for (let { date, count } of wholeDateCounts.getPayload()) {
    if (!date || !data.has(date)) {
      continue;
    }
    data.get(date)!.sequenced += count;
  }
  for (let { date, count } of variantDateCounts.getPayload()) {
    if (!date || !data.has(date)) {
      continue;
    }
    data.get(date)!.variantCount += count;
  }
  for (let { date, newCases } of caseCounts.getPayload()) {
    if (!date || !data.has(date)) {
      continue;
    }
    data.get(date)!.cases += newCases;
  }
  return <EstimatedCasesChartInner data={new Array(...data.values())} />;
};
