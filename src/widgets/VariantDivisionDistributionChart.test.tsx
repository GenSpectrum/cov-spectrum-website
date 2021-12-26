import 'jest-canvas-mock';
import ResizeObserver from 'resize-observer-polyfill';
import renderer, { act } from 'react-test-renderer';
import { maskUuid } from '../helpers/snapshot-tests-masking';
import React from 'react';
import { dataset0 } from '../helpers/snapshot-tests-data';
import { VariantDivisionDistributionChart } from './VariantDivisionDistributionChart';

window.ResizeObserver = ResizeObserver;

describe('<VariantDivisionDistributionChart>', () => {
  it('dataset0 renders correctly', async () => {
    const { variantDivisionCount, wholeDivisionCount } = dataset0;
    const tree = renderer.create(
      <VariantDivisionDistributionChart
        variantSampleSet={variantDivisionCount}
        wholeSampleSet={wholeDivisionCount}
      />
    );
    await act(async () => {});
    const snapshot = tree.toJSON();
    maskUuid(snapshot);
    expect(snapshot).toMatchSnapshot();
  });
});
