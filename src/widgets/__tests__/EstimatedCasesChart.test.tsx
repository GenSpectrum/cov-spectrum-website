import 'jest-canvas-mock';
import ResizeObserver from 'resize-observer-polyfill';
import React from 'react';
import { dataset0 } from '../../helpers/testing/snapshot-tests-data0';
import { EstimatedCasesChart } from '../EstimatedCasesChart';
import { renderAndWaitToMatchSnapshot } from '../../helpers/testing/renderAndWaitToMatchSnapshot';

window.ResizeObserver = ResizeObserver;
vi.mock('recharts');

describe('<EstimatedCasesChart>', () => {
  it('dataset0 renders correctly', async () => {
    const { variantDateCount, wholeDateCount, caseCount } = dataset0;

    await renderAndWaitToMatchSnapshot(
      <EstimatedCasesChart
        variantDateCounts={variantDateCount}
        wholeDateCounts={wholeDateCount}
        caseCounts={caseCount}
      />
    );
  });
});
