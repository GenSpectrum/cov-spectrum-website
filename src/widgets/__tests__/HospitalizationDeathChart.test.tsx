import 'jest-canvas-mock';
import ResizeObserver from 'resize-observer-polyfill';
import renderer, { act } from 'react-test-renderer';
import { maskUuid } from '../../helpers/testing/snapshot-tests-masking';
import React from 'react';
import { dataset1 } from '../../helpers/testing/snapshot-tests-data1';
import { HospitalizationDeathChart } from '../HospitalizationDeathChart';
import { useResizeDetector } from 'react-resize-detector';

window.ResizeObserver = ResizeObserver;
jest.mock('react-resize-detector');

jest.mock('../../data/api');

describe('<HospitalizationDeathChart>', () => {
  (['hospitalized', 'died'] as ('hospitalized' | 'died')[]).forEach(field =>
    it(`(${field} plot) dataset1 renders correctly`, async () => {
      (useResizeDetector as any).mockReturnValue({ width: 800, height: 400 });
      const { variantDetailedCount, wholeDetailedCount } = dataset1;
      const tree = renderer.create(
        <div style={{ width: '600px', height: '400px' }}>
          <HospitalizationDeathChart
            variantSampleSet={variantDetailedCount}
            wholeSampleSet={wholeDetailedCount}
            field={field}
            variantName='A random name'
          />
        </div>
      );
      await act(async () => {});
      const snapshot = tree.toJSON();
      maskUuid(snapshot);
      expect(snapshot).toMatchSnapshot();
    })
  );
});
