import 'jest-canvas-mock';
import ResizeObserver from 'resize-observer-polyfill';
import renderer, { act } from 'react-test-renderer';
import { maskUuid } from '../../helpers/testing/snapshot-tests-masking';
import React from 'react';
import { dataset0 } from '../../helpers/testing/snapshot-tests-data0';
import VariantTimeDistributionLineChart from '../VariantTimeDistributionLineChart';

window.ResizeObserver = ResizeObserver;

jest.mock('recharts');
jest.mock('../../data/api');

describe('<VariantTimeDistributionLineChart>', () => {
  it('dataset0 renders correctly', async () => {
    const { variantDateCount, wholeDateCount } = dataset0;
    const tree = renderer.create(
      <VariantTimeDistributionLineChart variantSampleSet={variantDateCount} wholeSampleSet={wholeDateCount} />
    );
    await act(async () => {});
    await act(async () => {});
    const snapshot = tree.toJSON();
    maskUuid(snapshot);
    expect(snapshot).toMatchSnapshot();
  });
});
