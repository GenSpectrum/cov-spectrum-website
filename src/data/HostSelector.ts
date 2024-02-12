import { isEqual } from '../helpers/lodash_alternatives';
import { defaultHost } from './default-selectors';

export type HostSelector = string[];

export function addHostSelectorToUrlSearchParams(selector: HostSelector, params: URLSearchParams) {
  params.delete('host');
  if (selector.length > 0) {
    selector.forEach(hostSelector => {
      params.append('host', hostSelector);
    });
  }
}

export function readHostSelectorFromUrlSearchParams(params: URLSearchParams): HostSelector {
  if (!params.has('host')) {
    return defaultHost;
  }
  return params.getAll('host');
}

export function isDefaultHostSelector(selector: HostSelector): boolean {
  return isEqual(selector, defaultHost);
}
