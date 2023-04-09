import { fetchLapisDataVersionDate } from './data/api-lapis';

(async () => {
  try {
    // Fetch current data version of LAPIS
    await fetchLapisDataVersionDate();
  } catch (_) {}
})();
