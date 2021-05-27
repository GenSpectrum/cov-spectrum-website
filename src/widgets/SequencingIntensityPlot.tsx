import _ from 'lodash';
import { getSequencingIntensity } from '../services/api';
import { SequencingIntensityEntry } from '../services/api-types';
import { Widget } from './Widget';
import { AsyncZodQueryEncoder } from '../helpers/query-encoder';
import TimeIntensityChart, { TimeIntensityEntry } from '../charts/TimeIntensityChart';
import DownloadWrapper from '../charts/DownloadWrapper';
import {
  SequencingIntensityEntrySetSelectorSchema,
  SequencingIntensityEntrySetWithSelector,
} from '../helpers/sequencing-intensity-entry-set';

interface Props {
  sequencingIntensityEntrySet: SequencingIntensityEntrySetWithSelector;
}

const groupByMonth = (entries: SequencingIntensityEntry[]): TimeIntensityEntry[] => {
  const groupedEntries = _(
    entries.map(d => ({
      firstDayInWeek: d.x,
      yearWeek: d.x.split('-')[0] + '-' + d.x.split('-')[1],
      proportion: d.y.numberSequenced,
      quantity: d.y.numberCases,
    }))
  )
    .groupBy('yearWeek')
    .map((monthData, id) => ({
      id: id,
      month: monthData[0].yearWeek,
      proportion: _.sumBy(monthData, 'proportion'),
      quantity: _.sumBy(monthData, 'quantity'),
    }))
    .value();
  if (groupedEntries[groupedEntries.length - 1].quantity === 0) {
    groupedEntries.pop();
  }
  return groupedEntries;
};

const processData = (data: SequencingIntensityEntry[]): any => groupByMonth(data);

export const SequencingIntensityPlot = ({ sequencingIntensityEntrySet }: Props) => {
  return (
    <DownloadWrapper name='SequencingIntensityPlot'>
      <TimeIntensityChart data={processData(sequencingIntensityEntrySet.data)} onClickHandler={_ => true} />
    </DownloadWrapper>
  );
};

export const SequencingIntensityPlotWidget = new Widget(
  new AsyncZodQueryEncoder(
    SequencingIntensityEntrySetSelectorSchema,

    async (decoded: Props) => decoded.sequencingIntensityEntrySet.selector,
    async (encoded, signal) => ({
      sequencingIntensityEntrySet: await getSequencingIntensity(encoded, signal),
    })
  ),
  SequencingIntensityPlot,
  'SequencingIntensityPlot'
);
