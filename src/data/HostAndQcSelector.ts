import { HostSelector } from './HostSelector';
import { QcSelector } from './QcSelector';
import { DateRangeSelector, defaultSubmissionDateRangeSelector } from './DateRangeSelector';
import { defaultHost } from './default-selectors';

export type HostAndQcSelector = {
  host: HostSelector | undefined;
  qc: QcSelector;
  submissionDate: DateRangeSelector;
};

export function addDefaultHostAndQc<T extends object>(obj: T): T & HostAndQcSelector {
  return {
    ...obj,
    host: defaultHost,
    qc: {},
    submissionDate: defaultSubmissionDateRangeSelector,
  };
}
