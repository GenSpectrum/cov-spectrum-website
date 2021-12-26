import 'jest-canvas-mock';
import ResizeObserver from 'resize-observer-polyfill';
import renderer, { act } from 'react-test-renderer';
import { maskUuid } from '../../helpers/testing/snapshot-tests-masking';
import React from 'react';
import VariantTimeDistributionBarChart from '../VariantTimeDistributionBarChart';
import { dataset0 } from '../../helpers/testing/snapshot-tests-data0';
import { useResizeDetector } from 'react-resize-detector';

window.ResizeObserver = ResizeObserver;
jest.mock('react-resize-detector');

describe('<VariantTimeDistributionBarChart>', () => {
  it('dataset0 renders correctly', async () => {
    (useResizeDetector as any).mockReturnValue({ width: 800, height: 400 });
    const { variantDateCount, wholeDateCount } = dataset0;
    const tree = renderer.create(
      <VariantTimeDistributionBarChart variantSampleSet={variantDateCount} wholeSampleSet={wholeDateCount} />
    );
    await act(async () => {});
    const snapshot = tree.toJSON();
    maskUuid(snapshot);
    expect(snapshot).toMatchSnapshot();
  });
});
