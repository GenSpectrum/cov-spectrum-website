import React from 'react';
import { fillAndFilterFromDailyMap } from '../helpers/fill-missing';
import {} from './VariantTimeDistributionBarChart';
import { UnifiedDay } from '../helpers/date-cache';
import { VariantTimeDistributionChartProps } from './VariantTimeDistributionChartWidget';
import {
  VariantTimeDistributionLineChartEntry,
  VariantTimeDistributionLineChartInner,
} from './VariantTimeDistributionLineChartInner';
import {AbsNumVariantTimeDistributionLineChartInner} from './AbsNumVariantTimeDistributionLineChartInner';

export const VariantTimeDistributionLineChart = React.memo(
  ({ wholeSampleSet, variantSampleSet, absNumView }: VariantTimeDistributionChartProps): JSX.Element => {
    const data: Map<UnifiedDay, VariantTimeDistributionLineChartEntry> = new Map();
    fillAndFilterFromDailyMap(
      new Map<UnifiedDay, Omit<VariantTimeDistributionLineChartEntry, 'date'>>(),
      {
        sequenced: 0,
        variantCount: 0,
      },
      variantSampleSet.selector.dateRange!.getDateRange()
    ).forEach(({ key, value }) => data.set(key, { ...value, date: key }));
    for (let { date, count } of wholeSampleSet.payload) {
      if (!date || !data.has(date)) {
        continue;
      }
      data.get(date)!.sequenced += count;
    }
    for (let { date, count } of variantSampleSet.payload) {
      if (!date || !data.has(date)) {
        continue;
      }
      data.get(date)!.variantCount += count;
    }

    //return <VariantTimeDistributionLineChartInner data={new Array(...data.values())} />;
    //return <AbsNumVariantTimeDistributionLineChartInner data={new Array(...data.values())} />;

    return absNumView?
    <VariantTimeDistributionLineChartInner data={new Array(...data.values())} />
    : <AbsNumVariantTimeDistributionLineChartInner data={new Array(...data.values())} />
  }
);

export default VariantTimeDistributionLineChart;
