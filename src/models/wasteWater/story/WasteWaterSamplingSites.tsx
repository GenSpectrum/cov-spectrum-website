import { legacyLocations } from './constants';
import { WasteWaterFilteredSites } from './WasteWaterFilteredSites';

export const WasteWaterSamplingSites = () => {
  return WasteWaterFilteredSites(
    (ds) => !legacyLocations.has(ds.location)
  );
};
