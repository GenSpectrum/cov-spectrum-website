import { useQuery } from './query-hook';
import { fetchCurrentUserCountry } from '../data/api';
import { LocationService } from '../services/LocationService';

export const useBaseLocation = (): string | undefined => {
  const dataQuery = useQuery(
    () => Promise.all([fetchCurrentUserCountry(), LocationService.getAllLocationNames()]),
    []
  );
  if (dataQuery.isLoading) {
    return undefined;
  }
  if (dataQuery.isError || !dataQuery.data) {
    return 'Europe';
  }
  const [currentUserCountry, allLocationNames] = dataQuery.data;
  if (currentUserCountry.country && allLocationNames.includes(currentUserCountry.country)) {
    return currentUserCountry.country;
  }
  if (currentUserCountry.region && allLocationNames.includes(currentUserCountry.region)) {
    return currentUserCountry.region;
  }
  return 'Europe';
};
