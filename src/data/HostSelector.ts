import { defaultHost } from '../helpers/explore-url';
import { isEqual } from '../helpers/lodash_alternatives';

export type HostSelector = string[];

export function addHostSelectorToUrlSearchParams(selector: HostSelector, params: URLSearchParams) {
  params.delete('host');
  if (selector.length > 0) {
    // TODO We assume that the names of the hosts do not have a ",". Is it safe?
    //  This is currently the case for all of our data.
    params.set('host', selector.join(','));
  }
}

export function readHostSelectorFromUrlSearchParams(params: URLSearchParams): HostSelector {
  if (!params.has('host')) {
    return defaultHost;
  }
  return params.get('host')!.split(',');
}

export function isDefaultHostSelector(selector: HostSelector): boolean {
  return isEqual(selector, defaultHost);
}
