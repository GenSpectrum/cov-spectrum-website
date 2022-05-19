import 'jest-canvas-mock';
import ResizeObserver from 'resize-observer-polyfill';
import renderer, { act } from 'react-test-renderer';
import { maskRegex, maskUuid } from '../../helpers/testing/snapshot-tests-masking';
import React from 'react';
import { dataset0 } from '../../helpers/testing/snapshot-tests-data0';
import { VariantDivisionDistributionChart } from '../VariantDivisionDistributionChart';
import { useResizeDetector } from 'react-resize-detector';

window.ResizeObserver = ResizeObserver;
jest.mock('react-resize-detector');

describe('<VariantDivisionDistributionChart>', () => {
  it('dataset0 renders correctly', async () => {
    const { variantDivisionCount, wholeDivisionCount } = dataset0;
    (useResizeDetector as any).mockReturnValue({ width: 800, height: 450 });
    const tree = renderer.create(
      <VariantDivisionDistributionChart
        variantSampleSet={variantDivisionCount}
        wholeSampleSet={wholeDivisionCount}
      />
    );
    await act(async () => {});
    const snapshot = tree.toJSON();
    maskUuid(snapshot);
    maskRegex(snapshot, /sc-[a-z]+[ ][a-z]+/gi); // Mask weird css class names that look like "sc-eCssSg enfXCs"
    expect(snapshot).toMatchSnapshot();
  });
});
