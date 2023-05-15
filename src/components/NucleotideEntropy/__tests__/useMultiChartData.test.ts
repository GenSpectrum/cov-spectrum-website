import { useMultiChartData } from '../useMultiChartData';
import { act, renderHook, waitFor } from '@testing-library/react';
import { SequenceType } from '../../../data/SequenceType';
import {
  ALL_GENES_SELECTED,
  DEFAULT_DATE_RANGE,
  DEFAULT_SELECTOR,
  expectedTicks,
  getSelector,
} from '../testUtils';
import { MutationProportionData } from '../../../data/MutationProportionDataset';

jest.mock('../../../data/api');

let mutationProportionDataMock = jest.fn() as jest.Mock<ReturnType<typeof MutationProportionData.fromApi>>;
MutationProportionData.fromApi = mutationProportionDataMock;

beforeEach(() => {
  jest.resetAllMocks();
});

describe('useMultiChartData', () => {
  test('should switch between nucleotide and amino acids', async () => {
    mutationProportionDataMock.mockResolvedValue({
      selector: DEFAULT_SELECTOR,
      payload: [{ mutation: 'T671G', proportion: 0.5, count: 42 }],
    });

    const { result, rerender } = renderHook(
      (sequenceType: SequenceType) =>
        useMultiChartData(
          [getSelector(DEFAULT_DATE_RANGE)],
          [ALL_GENES_SELECTED],
          ['variant'],
          sequenceType,
          false
        ),
      { initialProps: 'nuc' }
    );
    await act(() => {});

    expect(result.current).toStrictEqual({
      plotData: [
        { day: expectedTicks[0], variant: 0.000023179854213956635 },
        { day: expectedTicks[1], variant: 0.000023179854213956635 },
        { day: expectedTicks[2], variant: 0.000023179854213956635 },
      ],
      ticks: expectedTicks,
    });

    mutationProportionDataMock.mockReset();
    mutationProportionDataMock.mockResolvedValue({
      selector: DEFAULT_SELECTOR,
      payload: [
        { mutation: 'ORF8:R101C', proportion: 1, count: 42 },
        { mutation: 'ORF8:R102C', proportion: 1, count: 42 },
      ],
    });
    act(() => rerender('aa'));

    await waitFor(() => {
      expect(result.current).toStrictEqual({
        plotData: [
          { day: expectedTicks[0], variant: 0 },
          { day: expectedTicks[1], variant: 0 },
          { day: expectedTicks[2], variant: 0 },
        ],
        ticks: expectedTicks,
      });
    });
  });
});
