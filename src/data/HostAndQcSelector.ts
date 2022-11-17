import { HostSelector } from './HostSelector';
import { QcSelector } from './QcSelector';
import { defaultHost } from '../helpers/explore-url';
import { DateRangeRaw, DateRangeSelector, SpecialDateRangeSelector } from './DateRangeSelector';

const defaultDateSubmitted: DateRangeSelector = new SpecialDateRangeSelector('Past6M');

export type HostAndQcSelector = {
  host: HostSelector | undefined;
  qc: QcSelector;
  dateSubmitted?: DateRangeSelector;
  dateSubmittedRaw?: DateRangeRaw;
};

export function addDefaultHostAndQc<T extends object>(obj: T): T & HostAndQcSelector {
  return {
    ...obj,
    host: defaultHost,
    qc: {},
    dateSubmitted: defaultDateSubmitted,
  };
}
