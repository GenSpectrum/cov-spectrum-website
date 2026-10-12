import 'jest-canvas-mock';
import ResizeObserver from 'resize-observer-polyfill';
import React from 'react';
import { dataset1 } from '../../helpers/testing/snapshot-tests-data1';
import { HospitalizationDeathChart } from '../HospitalizationDeathChart';
import { useResizeDetector } from 'react-resize-detector';
import { renderAndWaitToMatchSnapshot } from '../../helpers/testing/renderAndWaitToMatchSnapshot';

window.ResizeObserver = ResizeObserver;

vi.mock('react-resize-detector');
vi.mock('recharts');
vi.mock('../../data/api');

describe('<HospitalizationDeathChart>', () => {
  (['hospitalized', 'died'] as ('hospitalized' | 'died')[]).forEach(field =>
    it(`(${field} plot) dataset1 renders correctly`, async () => {
      (useResizeDetector as any).mockReturnValue({ width: 800, height: 400 });
      const { variantDetailedCount, wholeDetailedCount } = dataset1;

      await renderAndWaitToMatchSnapshot(
        <div style={{ width: '600px', height: '400px' }}>
          <HospitalizationDeathChart
            variantSampleSet={variantDetailedCount}
            wholeSampleSet={wholeDetailedCount}
            field={field}
            variantName='A random name'
          />
        </div>
      );
    })
  );
});
