import DownloadWrapper from './DownloadWrapper';
import { DateCountSampleDataset } from '../data/sample/DateCountSampleDataset';
import { UnifiedDay } from '../helpers/date-cache';
import {
  SequencingIntensityChartInner,
  SequencingIntensityChartPlotEntry,
} from './SequencingIntensityChartInner';
import { Utils } from '../services/Utils';
import { AsyncDataset } from '../data/AsyncDataset';
import { LocationDateSelector } from '../data/LocationDateSelector';
import { CaseCountEntry } from '../data/CaseCountEntry';
import Loader from '../components/Loader';

export type SequencingIntensityChartProps = {
  sequencingCounts: DateCountSampleDataset;
  caseCounts: AsyncDataset<LocationDateSelector, CaseCountEntry[]>;
};

type SequencingIntensityEntry = {
  date: UnifiedDay;
  numberSequenced: number;
  numberCases: number;
};

const groupByMonth = (entries: SequencingIntensityEntry[]): SequencingIntensityChartPlotEntry[] => {
  const dateStringToYearMonth = (s: string) => s.split('-')[0] + '-' + s.split('-')[1];

  const grouped = Utils.groupBy(entries, e => dateStringToYearMonth(e.date.string));
  return [...grouped.entries()]
    .map(([month, entries]) => ({
      id: month,
      month,
      ...entries.reduce(
        (prev, curr) => ({
          total: prev.total + curr.numberCases,
          intense: prev.intense + curr.numberSequenced,
          nonIntense: prev.nonIntense + (curr.numberCases - curr.numberSequenced),
        }),
        {
          total: 0,
          intense: 0,
          nonIntense: 0,
        }
      ),
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
};

const processData = (data: SequencingIntensityEntry[]) => groupByMonth(data);

export const SequencingIntensityChart = ({ sequencingCounts, caseCounts }: SequencingIntensityChartProps) => {
  if (!caseCounts.payload) {
    return <Loader />;
  }
  const sequencingIntensityMap = new Map<UnifiedDay, SequencingIntensityEntry>();
  for (const { date, newCases } of caseCounts.payload) {
    if (!date) {
      continue;
    }
    if (!sequencingIntensityMap.has(date)) {
      sequencingIntensityMap.set(date, {
        date,
        numberCases: 0,
        numberSequenced: 0,
      });
    }
    sequencingIntensityMap.get(date)!.numberCases += newCases;
  }
  for (const { date, count } of sequencingCounts.payload) {
    if (!date) {
      continue;
    }
    if (!sequencingIntensityMap.has(date)) {
      sequencingIntensityMap.set(date, {
        date,
        numberCases: 0,
        numberSequenced: 0,
      });
    }
    sequencingIntensityMap.get(date)!.numberSequenced += count;
  }
  const sequencingIntensityEntries: SequencingIntensityEntry[] = [...sequencingIntensityMap.values()];

  const data = processData(sequencingIntensityEntries);
  const csvData = data.map(({ month, intense, total }) => ({
    month,
    sequenced: intense,
    cases: total,
    proportion: (intense / total).toFixed(6),
  }));
  return (
    <DownloadWrapper name='SequencingIntensityPlot' csvData={csvData}>
      <SequencingIntensityChartInner data={data} onClickHandler={_ => true} />
    </DownloadWrapper>
  );
};
