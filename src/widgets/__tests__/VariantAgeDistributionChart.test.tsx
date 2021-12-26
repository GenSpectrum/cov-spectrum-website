import 'jest-canvas-mock';
import ResizeObserver from 'resize-observer-polyfill';
import renderer, { act } from 'react-test-renderer';
import { maskUuid } from '../../helpers/snapshot-tests-masking';
import React from 'react';
import { dataset0 } from '../../helpers/snapshot-tests-data';
import VariantAgeDistributionChart from '../VariantAgeDistributionChart';

window.ResizeObserver = ResizeObserver;

describe('<VariantAgeDistributionChart>', () => {
  it('dataset0 renders correctly', async () => {
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
