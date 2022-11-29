import { FullSampleAggEntry } from '../data/sample/FullSampleAggEntry';
import { globalDateCache } from '../helpers/date-cache';
import { useMemo } from 'react';

type TmpEntry = Pick<FullSampleAggEntry, 'date' | 'nextcladePangoLineage' | 'count'>;
type Props = {
  data: TmpEntry[];
  plotWidth: number;
  plotHeight: number;
  numberColumns: number;
};

export const GridPlot = ({ data }: Props) => {

  const { plotData, dateRange, countRange } = useMemo(
    () => {
      let [minDate, maxDate] = [globalDateCache.getDay('2099-12-31'),
        globalDateCache.getDay('1900-01-01')];
      let [minCount, maxCount] = [Infinity, -Infinity];
      const topLevelMap = new Map<string, TmpEntry[]>();
      for (let d of data) {
        const {nextcladePangoLineage, date, count} = d;
        if (date!.dayjs.isBefore(minDate.dayjs)) {
          minDate = date!;
        }
        if (date!.dayjs.isAfter(maxDate.dayjs)) {
          maxDate = date!;
        }
        if (count < minCount) {
          minCount = count;
        }
        if (count > maxCount) {
          maxCount = count;
        }
        if (!topLevelMap.has(nextcladePangoLineage!)) {
          topLevelMap.set(nextcladePangoLineage!, []);
        }
        topLevelMap.get(nextcladePangoLineage!)!.push(d);
      }
      const plotData: { nextcladePangoLineage: string; entries: TmpEntry[] }[] = [];
      topLevelMap.forEach((entries, nextcladePangoLineage) => plotData.push({
        nextcladePangoLineage,
        entries,
      }));
      console.log(plotData);

      return { plotData, dateRange: [minDate, maxDate], countRange: [minCount, maxCount] };
    },
    [data]
  );

  // Hello, CSS-Grid!
  return <></>;
};
