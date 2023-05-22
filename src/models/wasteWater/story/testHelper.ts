import { WasteWaterDataWithLocation } from './WasteWaterSamplingSitesHooks';
import { globalDateCache } from '../../../helpers/date-cache';
import { WasteWaterTimeEntry } from '../types';

export function getTestWasteWaterDataWithLocation(
  dates = ['2021-01-01', '2021-01-02', '2021-01-03', '2021-01-04'],
  variants = ['variantName1'],
  locations = ['location1']
): WasteWaterDataWithLocation[] {
  const unifiedDays = dates.map(date => {
    return globalDateCache.getDay(date);
  });

  return locations.map(location => {
    return {
      location: location,
      variantsTimeseriesSummaries: variants.map(variant => {
        return {
          name: variant,
          data: unifiedDays.map(date => {
            return {
              date,
              proportion: 0.1,
              proportionCI: [0.1, 0.1],
            } as WasteWaterTimeEntry;
          }),
        };
      }),
    };
  });
}
