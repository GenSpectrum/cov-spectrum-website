import { SamplingStrategy } from '../../data/SamplingStrategy';
import { globalDateCache } from '../../helpers/date-cache';
import { getTicks } from '../../helpers/ticks';
import { DateRange } from '../../data/DateRange';
import { addDefaultHostAndQc } from '../../data/HostAndQcSelector';
import { FixedDateRangeSelector } from '../../data/DateRangeSelector';

export const DEFAULT_SELECTOR = {
  location: {},
  samplingStrategy: SamplingStrategy.AllSamples,
};

const DATE_FROM = globalDateCache.getDay('2023-05-01');
const DATE_TO = globalDateCache.getDay('2023-05-15');

export const DEFAULT_DATE_RANGE = {
  dateFrom: DATE_FROM,
  dateTo: DATE_TO,
};

export const ALL_GENES_SELECTED = {
  value: 'All',
  label: 'All',
  startPosition: 0,
  endPosition: 29903,
  aaSeq: '',
  color: 'some color',
};

const dateBetweenFromAndToThatDoesNotMatter = globalDateCache.getDay('2023-05-02');
export const expectedTicks = getTicks([
  { date: DATE_FROM.dayjs.toDate() },
  { date: dateBetweenFromAndToThatDoesNotMatter.dayjs.toDate() },
  { date: DATE_TO.dayjs.toDate() },
]);

export function getSelector(dateRange: DateRange) {
  return addDefaultHostAndQc({
    location: {},
    samplingStrategy: SamplingStrategy.AllSamples,
    dateRange: new FixedDateRangeSelector(dateRange),
  });
}
