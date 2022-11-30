import { LapisSelector } from '../data/LapisSelector';
import { SamplingStrategy } from '../data/SamplingStrategy';
import { SpecialDateRangeSelector } from '../data/DateRangeSelector';
import { useQuery } from '../helpers/query-hook';
import { _fetchAggSamples } from '../data/api-lapis';
import { FullSampleAggEntry } from '../data/sample/FullSampleAggEntry';
import Loader from '../components/Loader';
import { useMemo } from 'react';
import { GridPlot } from '../components/GridPlot/GridPlot';
import { useResizeDetector } from 'react-resize-detector';
import { PangoLineageAliasResolverService } from '../services/PangoLineageAliasResolverService';
import { UnifiedDay } from '../helpers/date-cache';

type TmpEntry = Pick<FullSampleAggEntry, 'date' | 'nextcladePangoLineage' | 'count'>;
type TmpEntry2 = TmpEntry & { nextcladePangoLineageFullName: string | null };
type TmpEntry3 = { date: UnifiedDay; nextcladePangoLineage: string; count: number };

export const ManyPage = () => {
  const { width, height, ref } = useResizeDetector<HTMLDivElement>();

  const selector: LapisSelector = {
    location: {},
    variant: {},
    dateRange: new SpecialDateRangeSelector('Past6M'),
    samplingStrategy: SamplingStrategy.AllSamples,
    host: undefined,
    qc: {},
  };

  const datePangoLineageCountQuery = useQuery(
    signal =>
      (_fetchAggSamples(selector, ['date', 'nextcladePangoLineage'], signal) as Promise<TmpEntry[]>).then(
        async data => {
          const data2: TmpEntry2[] = [];
          for (let d of data) {
            data2.push({
              ...d,
              nextcladePangoLineageFullName: d.nextcladePangoLineage
                ? (await PangoLineageAliasResolverService.findFullName(d.nextcladePangoLineage)) ?? null
                : null,
            });
          }
          return data2;
        }
      ),
    [selector]
  );

  const data = useMemo(() => {
    if (!datePangoLineageCountQuery.data) {
      return undefined;
    }
    const lineageDateMap = new Map<string, Map<UnifiedDay, TmpEntry3>>();
    for (let d of datePangoLineageCountQuery.data) {
      if (!d.nextcladePangoLineage || !d.nextcladePangoLineageFullName || !d.date) {
        continue;
      }
      const prefix = 'B.1.1.529.5.';
      if (!d.nextcladePangoLineageFullName.startsWith(prefix)) {
        continue;
      }
      const withoutPrefix = d.nextcladePangoLineageFullName.substring(prefix.length);
      const firstSub =
        withoutPrefix.indexOf('.') !== -1
          ? withoutPrefix.substring(0, withoutPrefix.indexOf('.'))
          : withoutPrefix;
      if (!lineageDateMap.has(firstSub)) {
        lineageDateMap.set(firstSub, new Map());
      }
      const dateMap = lineageDateMap.get(firstSub)!;
      if (!dateMap.has(d.date)) {
        dateMap.set(d.date, {
          date: d.date,
          nextcladePangoLineage:
            PangoLineageAliasResolverService.findAliasUnsafeSync(`${prefix}${firstSub}`) + '*',
          count: 0,
        });
      }
      dateMap.get(d.date)!.count += d.count;
    }
    const groupedAndFiltered: TmpEntry3[] = [];
    lineageDateMap.forEach(dateMap => {
      dateMap.forEach(e => groupedAndFiltered.push(e));
    });

    return groupedAndFiltered;
  }, [datePangoLineageCountQuery]);

  if (!data) {
    return <Loader />;
  }

  return (
    <>
      {/* TODO What to do about small screens? */}
      <div
        style={{
          // Subtracting the header  TODO It's not good to have these constants here
          height: 'calc(100vh - 72px - 2px)',
        }}
        className='flex flex-row'
      >
        {/* The parent node */}
        <div style={{ width: 300, minWidth: 300 }} className='border-2 border-solid border-red-800'></div>
        {/* The main area */}
        <div className='flex-grow border-2 border-solid border-blue-800 p-4' ref={ref}>
          {width && height && <GridPlot data={data} width={width} height={height} />}
        </div>
      </div>
    </>
  );
};
