import 'jest-canvas-mock';
import ResizeObserver from 'resize-observer-polyfill';
import renderer, { act } from 'react-test-renderer';
import { maskUuid } from '../../helpers/testing/snapshot-tests-masking';
import React from 'react';
import { dataset0 } from '../../helpers/testing/snapshot-tests-data0';
import { useResizeDetector } from 'react-resize-detector';
import { EstimatedCasesChart } from '../EstimatedCasesChart';

window.ResizeObserver = ResizeObserver;
jest.mock('react-resize-detector');

describe('<EstimatedCasesChart>', () => {
  it('dataset0 renders correctly', async () => {
    (useResizeDetector as any).mockReturnValue({ width: 800, height: 400 });
    const { variantDateCount, wholeDateCount, caseCount } = dataset0;
    const tree = renderer.create(
      <EstimatedCasesChart
        variantDateCounts={variantDateCount}
        wholeDateCounts={wholeDateCount}
        caseCounts={caseCount}
      />
    );
    await act(async () => {});
    const snapshot = tree.toJSON();
    maskUuid(snapshot);
    expect(snapshot).toMatchSnapshot();
  });
});
