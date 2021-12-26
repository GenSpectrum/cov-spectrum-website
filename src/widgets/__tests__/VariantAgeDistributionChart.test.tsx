import 'jest-canvas-mock';
import ResizeObserver from 'resize-observer-polyfill';
import renderer, { act } from 'react-test-renderer';
import { maskUuid } from '../../helpers/testing/snapshot-tests-masking';
import React from 'react';
import { dataset0 } from '../../helpers/testing/snapshot-tests-data0';
import VariantAgeDistributionChart from '../VariantAgeDistributionChart';
import { useResizeDetector } from 'react-resize-detector';

window.ResizeObserver = ResizeObserver;
jest.mock('react-resize-detector');

describe('<VariantAgeDistributionChart>', () => {
  it('dataset0 renders correctly', async () => {
    (useResizeDetector as any).mockReturnValue({ width: 800, height: 400 });
    const { variantAgeCount, wholeAgeCount } = dataset0;
    const tree = renderer.create(
      <VariantAgeDistributionChart variantSampleSet={variantAgeCount} wholeSampleSet={wholeAgeCount} />
    );
    await act(async () => {});
    const snapshot = tree.toJSON();
    maskUuid(snapshot);
    expect(snapshot).toMatchSnapshot();
  });
});
