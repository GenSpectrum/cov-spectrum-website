import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { App } from './App';
import { EmbedPage } from './pages/EmbedPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import { fetchCurrentUserCountry } from './data/api';
import { LocationService } from './services/LocationService';
import { fetchLapisDataVersionDate } from './data/api-lapis';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import { env } from './env';
import {
  DndProvider,
  TouchTransition,
  PointerTransition,
  MultiBackendOptions,
} from 'react-dnd-multi-backend';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';

export let baseLocation = 'Europe';

const HTML5toTouch: MultiBackendOptions = {
  backends: [
    {
      id: 'html5',
      backend: HTML5Backend,
      transition: PointerTransition,
    },
    {
      id: 'touch',
      backend: TouchBackend,
      options: {
        delayTouchStart: 200,
      },
      preview: true,
      transition: TouchTransition,
    },
  ],
};

//{ id: string; backend: BackendFactory; transition: Transition; options?: undefined; preview?: undefined; }

async function main() {
  // Initialize Sentry
  if (env.sentryDsn) {
    Sentry.init({
      dsn: env.sentryDsn,
      environment: env.sentryEnvironment,
      integrations: [new Integrations.BrowserTracing()],
      tracesSampleRate: 0,
      beforeSend: event => {
        if (
          event.message === 'ResizeObserver loop limit exceeded' ||
          event.message === 'ResizeObserver loop completed with undelivered notifications.'
        ) {
          // This error should be very harmless and not impact the user experience.
          // The error message is different in Chrome and Firefox.
          // See https://stackoverflow.com/questions/64238740/how-to-ignore-the-resizeobserver-loop-limit-exceeded-in-testcafe
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

  const container = document.getElementById('root');
  const root = createRoot(container!);
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path='/embed/:widget' element={<EmbedPage />} />
          <Route
            path='*'
            element={
              <DndProvider options={HTML5toTouch}>
                <App />
              </DndProvider>
            }
          />
        </Routes>
      </BrowserRouter>
    </React.StrictMode>
  );
}

main();
