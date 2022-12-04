import { LapisSelector } from '../../data/LapisSelector';
import { QueryStatus, useQuery } from '../../helpers/query-hook';
import { _fetchAggSamples, fetchDateCountSamples } from '../../data/api-lapis';
import { PangoLineageAliasResolverService } from '../../services/PangoLineageAliasResolverService';
import {
  GroupedData,
  ProportionValues,
  rolling7SumCountCentered,
  SingleData,
  sortDateAsc,
} from '../../data/transform/transform';
import { useMemo } from 'react';
import { globalDateCache, UnifiedDay } from '../../helpers/date-cache';
import { comparePangoLineages } from '../../data/transform/common';
import { FullSampleAggEntry } from '../../data/sample/FullSampleAggEntry';
import Loader from '../Loader';
import { SequencesOverTimeGridInner } from './SequencesOverTimeGridInner';
import { HtmlPortalNode, InPortal } from 'react-reverse-portal';
import { AxisPortals } from './common';

type TmpEntry = Pick<FullSampleAggEntry, 'date' | 'nextcladePangoLineage' | 'count'>;
type TmpEntry2 = TmpEntry & { nextcladePangoLineageFullName: string | null };
type TmpEntry3 = {
  date: UnifiedDay;
  nextcladePangoLineage: string;
  nextcladePangoLineageFullName: string;
  count: number;
};
type TmpEntry4 = { date: UnifiedDay; nextcladePangoLineage: string; count: number };
type TmpEntry5 = { date: UnifiedDay; count: number };
export type TmpEntry6 = TmpEntry4 & ProportionValues;

type Props = {
  selector: LapisSelector;
  plotWidth: number;
  pangoLineage: string;
  portals: Map<string, HtmlPortalNode>;
  axisPortals: AxisPortals;
};

export const SequencesOverTimeGrid = ({ selector, pangoLineage, portals, axisPortals, plotWidth }: Props) => {
  // Data fetching
  const dataQuery: QueryStatus<[TmpEntry3[], TmpEntry5[]]> = useQuery(
    signal =>
      Promise.all([
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
        fetchDateCountSamples(selector, signal).then(data => data.filter(d => !!d.date) as TmpEntry5[]),
      ]),
    [selector]
  );

  // Data transformation
  const data: GroupedData<TmpEntry6, string> | undefined = useMemo(() => {
    if (!dataQuery.data) {
      return undefined;
    }
    const [datePangoLineageCount, dateCount] = dataQuery.data;
    const currentLineage = pangoLineage;
    const currentLineageFullName =
      PangoLineageAliasResolverService.findFullNameUnsafeSync(currentLineage) ?? pangoLineage;
    const dateRangeInData = globalDateCache.rangeFromDays(datePangoLineageCount.map(d => d.date));
    const allDays = globalDateCache.daysFromRange(dateRangeInData);
    const lineagesData = new SingleData(datePangoLineageCount)
      .filter(
        d =>
          d.nextcladePangoLineage === currentLineage ||
          d.nextcladePangoLineageFullName.startsWith(currentLineageFullName + '.')
      )
      .map(d => {
        let lineage;
        if (d.nextcladePangoLineage === pangoLineage) {
          lineage = pangoLineage;
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
      .mapGroups((es, nextcladePangoLineage) => {
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
      .sort(sortDateAsc)
      .rolling(7, rolling7SumCountCentered);
    const wholeData = new SingleData(dateCount)
      .fill(
        e => e.date,
        allDays,
        date => ({
          date,
          count: 0,
        })
      )
      .sort(sortDateAsc)
      .rolling(7, rolling7SumCountCentered);
    // TODO HACK(Chaoran) "as SingleData<TmpEntry4>" is wrong. Instead, the typing of divideBySingle should be improved.
    const proportionData = lineagesData
      .divideBySingle(
        wholeData as SingleData<TmpEntry4>,
        e => e.date,
        e => e.count
      )
      .sortGroups(comparePangoLineages);

    return proportionData;
  }, [dataQuery, pangoLineage]);

  // View
  return (
    <>
      {data?.data.size ? (
        // TODO Define a better key? Goal is to refresh the grid plot whenever the data changes
        <SequencesOverTimeGridInner
          key={pangoLineage}
          data={data}
          plotWidth={plotWidth}
          portals={portals}
          axisPortals={axisPortals}
        />
      ) : (
        [...portals].map(([subLineage, portal]) => (
          <InPortal node={portal} key={subLineage}>
            <div style={{ width: plotWidth, height: plotWidth }}>
              <Loader />
            </div>
          </InPortal>
        ))
      )}
    </>
  );
};
