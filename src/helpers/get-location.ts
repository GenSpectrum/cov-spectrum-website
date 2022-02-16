import { ExploreUrl } from './explore-url';

// get location of current page to render it in page title
export function getLocation(exploreUrl?: ExploreUrl): string {
  let locationObj: any = exploreUrl?.location!;
  let place: string =
    'country' in locationObj
      ? locationObj['country']
      : 'region' in locationObj
      ? locationObj['region']
      : 'World';
  return place
}