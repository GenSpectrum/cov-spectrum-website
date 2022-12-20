import { HostSelector } from './HostSelector';
import { QcSelector } from './QcSelector';
import { defaultHost } from '../helpers/explore-url';
import { DateRangeSelector } from './DateRangeSelector';

export type HostAndQcSelector = {
  host: HostSelector | undefined;
  qc: QcSelector;
  submissionDate?: DateRangeSelector | null;
};

export function addDefaultHostAndQc<T extends object>(obj: T): T & HostAndQcSelector {
  return {
    ...obj,
    host: defaultHost,
    qc: {},
  };
}
