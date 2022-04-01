import { HostSelector } from './HostSelector';
import { QcSelector } from './QcSelector';
import { defaultHost } from '../helpers/explore-url';

export type HostAndQcSelector = {
  host: HostSelector | undefined;
  qc: QcSelector;
};

export function addDefaultHostAndQc<T extends object>(obj: T): T & HostAndQcSelector {
  return {
    ...obj,
    host: defaultHost,
    qc: {},
  };
}
