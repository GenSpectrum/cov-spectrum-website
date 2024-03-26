import { legacyLocations } from './constants';
import { WasteWaterFilteredSites } from './WasteWaterFilteredSites';

export const WasteWaterLegacySites = () => {
  return WasteWaterFilteredSites(
    (ds) => legacyLocations.has(ds.location)
  );
};
