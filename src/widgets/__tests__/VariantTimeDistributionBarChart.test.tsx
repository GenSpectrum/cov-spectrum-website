import 'jest-canvas-mock';
import ResizeObserver from 'resize-observer-polyfill';
import React from 'react';
import VariantTimeDistributionBarChart from '../VariantTimeDistributionBarChart';
import { dataset0 } from '../../helpers/testing/snapshot-tests-data0';
import { renderAndWaitToMatchSnapshot } from '../../helpers/testing/renderAndWaitToMatchSnapshot';

window.ResizeObserver = ResizeObserver;

vi.mock('recharts');
vi.mock('../../data/api');

describe('<VariantTimeDistributionBarChart>', () => {
  it('dataset0 renders correctly', async () => {
    const { variantDateCount, wholeDateCount } = dataset0;

    await renderAndWaitToMatchSnapshot(
      <VariantTimeDistributionBarChart variantSampleSet={variantDateCount} wholeSampleSet={wholeDateCount} />
    );
  });
});
