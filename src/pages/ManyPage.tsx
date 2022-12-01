import { LapisSelector } from '../data/LapisSelector';
import { SamplingStrategy } from '../data/SamplingStrategy';
import { SpecialDateRangeSelector } from '../data/DateRangeSelector';
import { QueryStatus, useQuery } from '../helpers/query-hook';
import { _fetchAggSamples } from '../data/api-lapis';
import { FullSampleAggEntry } from '../data/sample/FullSampleAggEntry';
import Loader from '../components/Loader';
import { useMemo } from 'react';
import { GridPlot } from '../components/GridPlot/GridPlot';
import { useResizeDetector } from 'react-resize-detector';
import { PangoLineageAliasResolverService } from '../services/PangoLineageAliasResolverService';
import { globalDateCache, UnifiedDay } from '../helpers/date-cache';
import { useHistory, useLocation } from 'react-router';
import { SingleData } from '../data/transform/transform';

type TmpEntry = Pick<FullSampleAggEntry, 'date' | 'nextcladePangoLineage' | 'count'>;
type TmpEntry2 = TmpEntry & { nextcladePangoLineageFullName: string | null };
type TmpEntry3 = {
  date: UnifiedDay;
  nextcladePangoLineage: string;
  nextcladePangoLineageFullName: string;
  count: number;
};
type TmpEntry4 = { date: UnifiedDay; nextcladePangoLineage: string; count: number };

export const ManyPage = () => {
  const { width, height, ref } = useResizeDetector<HTMLDivElement>();

  const history = useHistory();
  const params = useUrlParams();

  const selector: LapisSelector = {
    location: {},
    variant: {},
    dateRange: new SpecialDateRangeSelector('Past6M'),
    samplingStrategy: SamplingStrategy.AllSamples,
    host: undefined,
    qc: {},
  };

  const datePangoLineageCountQuery: QueryStatus<TmpEntry3[]> = useQuery(
    signal =>
      (_fetchAggSamples(selector, ['date', 'nextcladePangoLineage'], signal) as Promise<TmpEntry[]>).then(
        async data => {
          const data2: TmpEntry2[] = [];
          for (let d of data) {
            data2.push({
              ...d,
              nextcladePangoLineageFullName: d.nextcladePangoLineage
                ? (await PangoLineageAliasResolverService.findFullName(d.nextcladePangoLineage)) ??
                  d.nextcladePangoLineage
                : null,
            });
          }
          return data2.filter(d => !!d.date && !!d.nextcladePangoLineage) as TmpEntry3[];
        }
      ),
    [selector]
  );

  const data = useMemo(() => {
    if (!datePangoLineageCountQuery.data) {
      return undefined;
    }
    const currentLineage = params.pangoLineage;
    const currentLineageFullName =
      PangoLineageAliasResolverService.findFullNameUnsafeSync(currentLineage) ?? params.pangoLineage;
    const dateRangeInData = globalDateCache.rangeFromDays(datePangoLineageCountQuery.data.map(d => d.date));
    const allDays = globalDateCache.daysFromRange(dateRangeInData);
    const lineagesData = new SingleData(datePangoLineageCountQuery.data)
      .filter(
        d =>
          d.nextcladePangoLineage === currentLineage ||
          d.nextcladePangoLineageFullName.startsWith(currentLineageFullName + '.')
      )
      .map(d => {
        let lineage;
        if (d.nextcladePangoLineage === params.pangoLineage) {
          lineage = params.pangoLineage;
        } else {
          // These are the sub-lineages
          const withoutPrefix = d.nextcladePangoLineageFullName.substring(currentLineageFullName.length + 1);
          const firstSub =
            withoutPrefix.indexOf('.') !== -1
              ? withoutPrefix.substring(0, withoutPrefix.indexOf('.'))
              : withoutPrefix;
          lineage =
            PangoLineageAliasResolverService.findAliasUnsafeSync(`${currentLineageFullName}.${firstSub}`) +
            '*';
        }
        return {
          date: d.date,
          nextcladePangoLineage: lineage,
          count: d.count,
        };
      })
      .groupBy(e => e.nextcladePangoLineage)
      .mapEachGroup((es, nextcladePangoLineage) => {
        const dateData = es.groupBy(e => e.date);
        const dateMap = new Map<UnifiedDay, number>();
        dateData.data.forEach((ds, date) =>
          dateMap.set(
            date,
            ds.data.reduce((prev, curr) => prev + curr.count, 0)
          )
        );
        const reducedData: TmpEntry4[] = [];
        dateMap.forEach((count, date) => reducedData.push({ nextcladePangoLineage, date, count }));
        return new SingleData(reducedData);
      })
      .fill(
        e => e.date,
        allDays,
        (date, nextcladePangoLineage) => ({
          date,
          nextcladePangoLineage,
          count: 0,
        })
      )
      .sort((a, b) => (a.date.dayjs.isBefore(b.date.dayjs) ? -1 : 1))
      .rolling(7, entries => ({
        date: entries[3].date,
        nextcladePangoLineage: entries[3].nextcladePangoLineage,
        count: entries.reduce((prev, curr) => prev + curr.count, 0),
      }));

    const groupedAndFiltered: TmpEntry4[] = [];
    lineagesData.data.forEach(ds => {
      ds.data.forEach(d => groupedAndFiltered.push(d));
    });
    return groupedAndFiltered;
  }, [datePangoLineageCountQuery, params.pangoLineage]);

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
          {data.length ? (
            width &&
            height && (
              // TODO Define a better key? Goal is to refresh the grid plot whenever the data changes
              <GridPlot
                key={params.pangoLineage}
                data={data}
                width={width}
                height={height}
                setPangoLineage={pangoLineage =>
                  setParams(history, { ...params, pangoLineage: pangoLineage.replace('*', '') })
                }
              />
            )
          ) : (
            <>No sub-lineages available</>
          )}
        </div>
      </div>
    </>
  );
};

type UrlParams = {
  pangoLineage: string;
};

const useUrlParams = (): UrlParams => {
  const queryString = useLocation().search;
  const query = useMemo(() => new URLSearchParams(queryString), [queryString]);

  const params = useMemo(() => {
    return {
      pangoLineage: query.get('pangoLineage') ?? 'B',
    };
  }, [query]);

  return params;
};

const setParams = (history: any, params: UrlParams) => {
  // TODO properly type "history"
  history.push(`/many?${new URLSearchParams(params).toString()}`);
};
