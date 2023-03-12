import { fetchLapisDataVersionDate } from './data/api-lapis';

export const baseLocation = 'Switzerland';

(async () => {
  try {
    // Fetch current data version of LAPIS
    await fetchLapisDataVersionDate();
  } catch (_) {}
})();
