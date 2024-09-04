import { LapisSelector } from '../../data/LapisSelector';
import { useQuery } from '../../helpers/query-hook';
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

// A utility type that forces all properties of T to be non-nullable.
type RequiredAndNonNullable<T> = { [K in keyof T]: NonNullable<T[K]> };

type WithPangoLineageFullName = { nextcladePangoLineageFullName: string | null };
type EntryNullable = Pick<FullSampleAggEntry, 'date' | 'nextcladePangoLineage' | 'count'>;
type EntryNullableWithFullName = EntryNullable & WithPangoLineageFullName;
type Entry = RequiredAndNonNullable<EntryNullable>;
type EntryWithFullName = RequiredAndNonNullable<EntryNullableWithFullName>;
type EntryDateCount = { date: UnifiedDay; count: number };
export type EntryDateCountWithProportions = Entry & ProportionValues;

type Props = {
  selector: LapisSelector;
  plotWidth: number;
  pangoLineage: string;
  portals: Map<string, HtmlPortalNode>;
  axisPortals: AxisPortals;
};

export const SequencesOverTimeGrid = ({ selector, pangoLineage, portals, axisPortals, plotWidth }: Props) => {
  // Data fetching
  const dataQuery = useQuery(signal => fetchDatePangoLineageCount(selector, signal), [selector]);

  // Data transformation
  const data: GroupedData<EntryDateCountWithProportions, string> | undefined = useMemo(() => {
    if (!dataQuery.data) {
      return undefined;
    }
    return calculateProportionPerPangoLineage({ currentLineage: pangoLineage, ...dataQuery.data });
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

export const fetchDatePangoLineageCount = async (
  selector: LapisSelector,
  signal: AbortSignal
): Promise<{ datePangoLineageCount: EntryWithFullName[]; dateCount: EntryDateCount[] }> => {
  const [datePangoLineageCount, dateCount] = await Promise.all([
    (_fetchAggSamples(selector, ['date', 'nextcladePangoLineage'], signal) as Promise<EntryNullable[]>).then(
      async data => {
        const data2: EntryNullableWithFullName[] = [];
        for (let d of data) {
          data2.push({
            ...d,
            nextcladePangoLineageFullName: d.nextcladePangoLineage
              ? ((await PangoLineageAliasResolverService.findFullName(d.nextcladePangoLineage)) ??
                d.nextcladePangoLineage)
              : null,
          });
        }
        return data2.filter(d => !!d.date && !!d.nextcladePangoLineage) as EntryWithFullName[];
      }
    ),
    fetchDateCountSamples(selector, signal).then(data => data.filter(d => !!d.date) as EntryDateCount[]),
  ]);
  return { datePangoLineageCount, dateCount };
};

export const groupBySubLineage = ({
  currentLineage,
  datePangoLineageCount,
}: {
  currentLineage: string;
  datePangoLineageCount: EntryWithFullName[];
}): GroupedData<Entry, string> => {
  const currentLineageFullName =
    PangoLineageAliasResolverService.findFullNameUnsafeSync(currentLineage) ?? currentLineage;
  const dateRangeInData = globalDateCache.rangeFromDays(datePangoLineageCount.map(d => d.date));
  const allDays = globalDateCache.daysFromRange(dateRangeInData);
  return new SingleData(datePangoLineageCount)
    .filter(
      d =>
        d.nextcladePangoLineage === currentLineage ||
        d.nextcladePangoLineageFullName.startsWith(currentLineageFullName + '.')
    )
    .map(d => {
      let lineage;
      if (d.nextcladePangoLineage === currentLineage) {
        lineage = currentLineage;
      } else {
        // These are the sub-lineages
        const withoutPrefix = d.nextcladePangoLineageFullName.substring(currentLineageFullName.length + 1);
        const firstSub =
          withoutPrefix.indexOf('.') !== -1
            ? withoutPrefix.substring(0, withoutPrefix.indexOf('.'))
            : withoutPrefix;
        lineage =
          PangoLineageAliasResolverService.findAliasUnsafeSync(`${currentLineageFullName}.${firstSub}`) + '*';
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
      const reducedData: Entry[] = [];
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
    .sort(sortDateAsc);
};

export const calculateProportionPerPangoLineage = ({
  currentLineage,
  datePangoLineageCount,
  dateCount,
  performSmoothing = true,
}: {
  currentLineage: string;
  datePangoLineageCount: EntryWithFullName[];
  dateCount: EntryDateCount[];
  performSmoothing?: boolean;
}): GroupedData<EntryDateCountWithProportions, string> => {
  const dateRangeInData = globalDateCache.rangeFromDays(datePangoLineageCount.map(d => d.date));
  const allDays = globalDateCache.daysFromRange(dateRangeInData);
  let lineagesData = groupBySubLineage({ currentLineage, datePangoLineageCount });
  let wholeData = new SingleData(dateCount)
    .fill(
      e => e.date,
      allDays,
      date => ({
        date,
        count: 0,
      })
    )
    .sort(sortDateAsc);
  if (performSmoothing) {
    lineagesData = lineagesData.rolling(7, rolling7SumCountCentered);
    wholeData = wholeData.rolling(7, rolling7SumCountCentered);
  }
  // TODO HACK(Chaoran) "as SingleData<Entry>" is wrong. Instead, the typing of divideBySingle should be improved.
  return lineagesData
    .divideBySingle(
      wholeData as SingleData<Entry>,
      e => e.date,
      e => e.count
    )
    .sortGroups(comparePangoLineages);
};
