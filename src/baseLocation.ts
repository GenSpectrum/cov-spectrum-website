import { fetchLapisDataVersionDate } from './data/api-lapis';
import { fetchCurrentUserCountry } from './data/api';
import { LocationService } from './services/LocationService';

export let baseLocation = 'Europe';

(async () => {
  try {
    // Fetch current data version of LAPIS
    await fetchLapisDataVersionDate();

    // Find out the country/region of the user
    const [currentUserCountry, allLocationNames] = await Promise.all([
      fetchCurrentUserCountry(),
      LocationService.getAllLocationNames(),
    ]);
    if (currentUserCountry.country && allLocationNames.includes(currentUserCountry.country)) {
      baseLocation = currentUserCountry.country;
    } else if (currentUserCountry.region && allLocationNames.includes(currentUserCountry.region)) {
      baseLocation = currentUserCountry.region;
    }
  } catch (_) {}
})();
