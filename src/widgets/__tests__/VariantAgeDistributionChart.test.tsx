import 'jest-canvas-mock';
import ResizeObserver from 'resize-observer-polyfill';
import renderer, { act } from 'react-test-renderer';
import { maskUuid } from '../../helpers/testing/snapshot-tests-masking';
import React from 'react';
import { dataset0 } from '../../helpers/testing/snapshot-tests-data0';
import VariantAgeDistributionChart from '../VariantAgeDistributionChart';

window.ResizeObserver = ResizeObserver;

jest.mock('../../data/api');
jest.mock('recharts');

describe('<VariantAgeDistributionChart>', () => {
  it('dataset0 renders correctly', async () => {
    const { variantAgeCount, wholeAgeCount } = dataset0;

    let tree: any = null;
    await act(async () => {
      tree = renderer.create(
        <VariantAgeDistributionChart variantSampleSet={variantAgeCount} wholeSampleSet={wholeAgeCount} />
      );
    });
    const snapshot = tree!.toJSON();
    maskUuid(snapshot);
    expect(snapshot).toMatchSnapshot();
  });
});
