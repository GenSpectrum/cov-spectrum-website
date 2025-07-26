import 'jest-canvas-mock';
import ResizeObserver from 'resize-observer-polyfill';
import React from 'react';
import { dataset0 } from '../../helpers/testing/snapshot-tests-data0';
import VariantTimeDistributionLineChart from '../VariantTimeDistributionLineChart';
import { renderAndWaitToMatchSnapshot } from '../../helpers/testing/renderAndWaitToMatchSnapshot';

window.ResizeObserver = ResizeObserver;

jest.mock('recharts');
jest.mock('../../data/api');

describe('<VariantTimeDistributionLineChart>', () => {
  it('dataset0 renders correctly', async () => {
    const { variantDateCount, wholeDateCount } = dataset0;
    await renderAndWaitToMatchSnapshot(
      <VariantTimeDistributionLineChart variantSampleSet={variantDateCount} wholeSampleSet={wholeDateCount} />
    );
  });
});
