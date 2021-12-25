import 'jest-canvas-mock';
import ResizeObserver from 'resize-observer-polyfill';
import renderer from 'react-test-renderer';
import { maskUuid } from '../helpers/snapshot-tests-masking';
import React from 'react';
import { dataset0 } from '../helpers/snapshot-tests-data';
import VariantTimeDistributionLineChart from './VariantTimeDistributionLineChart';

window.ResizeObserver = ResizeObserver;

describe('<VariantTimeDistributionLineChart>', () => {
  it('renders correctly', () => {
    const { variantSampleSet, wholeSampleSet } = dataset0;
    const tree = renderer
      .create(
        <VariantTimeDistributionLineChart
          variantSampleSet={variantSampleSet}
          wholeSampleSet={wholeSampleSet}
        />
      )
      .toJSON();
    maskUuid(tree);
    expect(tree).toMatchSnapshot();
  });
});
