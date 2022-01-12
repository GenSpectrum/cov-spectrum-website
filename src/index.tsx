import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { App } from './App';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { EmbedPage } from './pages/EmbedPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import { fetchCurrentUserCountry } from './data/api';
import { LocationService } from './services/LocationService';
import { fetchLapisDataVersionDate } from './data/api-lapis';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import { env } from './env';

export let baseLocation = 'Europe';

async function main() {
  // Initialize Sentry
  if (env.sentryDsn) {
    Sentry.init({
      dsn: env.sentryDsn,
      environment: env.sentryEnvironment,
      integrations: [new Integrations.BrowserTracing()],
      tracesSampleRate: 0,
      beforeSend: event => {
        if (event.message === 'ResizeObserver loop limit exceeded') {
          // This error should be very harmless and not impact the user experience.
          return null;
        }
        return event;
      },
    });
  }

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

  ReactDOM.render(
    <React.StrictMode>
      <BrowserRouter>
        <Switch>
          <Route path='/embed/:widget'>
            <EmbedPage />
          </Route>
          <Route path='/'>
            <App />
          </Route>
        </Switch>
      </BrowserRouter>
    </React.StrictMode>,
    document.getElementById('root')
  );
}

main();
