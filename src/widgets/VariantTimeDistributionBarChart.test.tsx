import 'jest-canvas-mock';
import ResizeObserver from 'resize-observer-polyfill';
import renderer from 'react-test-renderer';
import { maskUuid } from '../helpers/snapshot-tests-masking';
import React from 'react';
import VariantTimeDistributionBarChart from './VariantTimeDistributionBarChart';
import { dataset0 } from '../helpers/snapshot-tests-data';

window.ResizeObserver = ResizeObserver;

describe('<VariantTimeDistributionBarChart>', () => {
  it('renders correctly', () => {
    const { variantSampleSet, wholeSampleSet } = dataset0;
    const tree = renderer
      .create(
        <VariantTimeDistributionBarChart
          variantSampleSet={variantSampleSet}
          wholeSampleSet={wholeSampleSet}
        />
      )
      .toJSON();
    maskUuid(tree);
    expect(tree).toMatchSnapshot();
  });
});
