import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { App } from './App';
import { EmbedPage } from './pages/EmbedPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import {
  DndProvider,
  MultiBackendOptions,
  PointerTransition,
  TouchTransition,
} from 'react-dnd-multi-backend';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import setupDayjs from './helpers/dayjsSetup';

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

async function main() {
  setupDayjs();

  const container = document.getElementById('root');
  const root = createRoot(container!);
  root.render(
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
  );
}

main();
