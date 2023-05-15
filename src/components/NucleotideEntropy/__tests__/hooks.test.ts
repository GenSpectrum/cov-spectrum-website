import { act, renderHook } from '@testing-library/react';
import { useNucleotideEntropyDataByPosition, useNucleotideEntropyDataByTime } from '../hooks';
import { MutationProportionData } from '../../../data/MutationProportionDataset';
import { SequenceType } from '../../../data/SequenceType';
import {
  ALL_GENES_SELECTED,
  DEFAULT_DATE_RANGE,
  DEFAULT_SELECTOR,
  expectedTicks,
  getSelector,
} from '../testUtils';

jest.mock('../../../data/api');

let mutationProportionDataMock = jest.fn() as jest.Mock<ReturnType<typeof MutationProportionData.fromApi>>;
MutationProportionData.fromApi = mutationProportionDataMock;

beforeEach(() => {
  jest.resetAllMocks();
});

describe('useNucleotideEntropyDataByPosition', () => {
  test('should return undefined if backend request fails', async () => {
    mutationProportionDataMock.mockRejectedValue('no data');

    const { result } = renderHook(() =>
      useNucleotideEntropyDataByPosition(getSelector(DEFAULT_DATE_RANGE), 'aa', false, false)
    );
    await act(() => {});

    expect(result.current).toBe(undefined);
  });

  test('should return no entropy for two mutations that always occur', async () => {
    mutationProportionDataMock.mockResolvedValue({
      selector: DEFAULT_SELECTOR,
      payload: [
        { mutation: 'T670G', proportion: 1, count: 42 },
        { mutation: 'T671G', proportion: 1, count: 42 },
      ],
    });

    const { result } = renderHook(() =>
      useNucleotideEntropyDataByPosition(getSelector(DEFAULT_DATE_RANGE), 'nuc', false, false)
    );
    await act(() => {});

    expect(result.current).toStrictEqual([
      {
        entropy: -0,
        original: 'T',
        position: '670',
        proportions: [{ mutation: 'G', original: 'T', position: '670', proportion: 1 }],
      },
      {
        entropy: -0,
        original: 'T',
        position: '671',
        proportions: [{ mutation: 'G', original: 'T', position: '671', proportion: 1 }],
      },
    ]);
  });

  test('should compute entropy for a mutation', async () => {
    mutationProportionDataMock.mockResolvedValue({
      selector: DEFAULT_SELECTOR,
      payload: [{ mutation: 'T671G', proportion: 0.3, count: 42 }],
    });

    const { result } = renderHook(() =>
      useNucleotideEntropyDataByPosition(getSelector(DEFAULT_DATE_RANGE), 'nuc', false, false)
    );
    await act(() => {});

    expect(result.current).toStrictEqual([
      {
        entropy: 0.6108643020548935,
        original: 'T',
        position: '671',
        proportions: [
          { mutation: 'G', original: 'T', position: '671', proportion: 0.3 },
          { mutation: 'T (ref)', original: 'T', position: '671', proportion: 0.7 },
        ],
      },
    ]);
  });

  test('should compute entropy for a mutation including zero entropy positions', async () => {
    mutationProportionDataMock.mockResolvedValue({
      selector: DEFAULT_SELECTOR,
      payload: [{ mutation: 'T671G', proportion: 0.3, count: 42 }],
    });

    const { result } = renderHook(() =>
      useNucleotideEntropyDataByPosition(getSelector(DEFAULT_DATE_RANGE), 'nuc', false, true)
    );
    await act(() => {});

    expect(result.current).toHaveLength(29_903);

    const positionThatHadData = result.current?.find(positionEntropy => positionEntropy.position === '671');
    expect(positionThatHadData).toStrictEqual({
      entropy: 0.6108643020548935,
      original: 'A',
      position: '671',
      proportions: [
        { mutation: 'G', original: 'T', position: '671', proportion: 0.3 },
        { mutation: 'A (ref)', original: 'A', position: '671', proportion: 0.7 },
      ],
    });
  });

  test('should compute entropy for an amino acid mutation', async () => {
    mutationProportionDataMock.mockResolvedValue({
      selector: DEFAULT_SELECTOR,
      payload: [{ mutation: 'ORF8:R101C', proportion: 0.3, count: 42 }],
    });

    const { result } = renderHook(() =>
      useNucleotideEntropyDataByPosition(getSelector(DEFAULT_DATE_RANGE), 'aa', false, false)
    );
    await act(() => {});

    expect(result.current).toStrictEqual([
      {
        entropy: 0.6108643020548935,
        original: 'R',
        position: 'ORF8:R101',
        proportions: [
          { mutation: 'C', original: 'R', position: 'ORF8:R101', proportion: 0.3 },
          { mutation: 'R (ref)', original: 'R', position: 'ORF8:R101', proportion: 0.7 },
        ],
      },
    ]);
  });

  test('should switch between nucleotide and amino acids', async () => {
    mutationProportionDataMock.mockResolvedValueOnce({
      selector: DEFAULT_SELECTOR,
      payload: [{ mutation: 'T671G', proportion: 0.3, count: 42 }],
    });

    const { result, rerender } = renderHook(
      (sequenceType: SequenceType) =>
        useNucleotideEntropyDataByPosition(getSelector(DEFAULT_DATE_RANGE), sequenceType, false, false),
      { initialProps: 'nuc' }
    );
    await act(() => {});

    expect(result.current).toHaveLength(1);

    mutationProportionDataMock.mockResolvedValueOnce({
      selector: DEFAULT_SELECTOR,
      payload: [
        { mutation: 'ORF8:R101C', proportion: 0.3, count: 42 },
        { mutation: 'ORF8:R102C', proportion: 0.3, count: 42 },
      ],
    });

    await act(() => {
      rerender('aa');
    });

    expect(result.current).toHaveLength(2);
  });

  test('should compute entropy for an amino acid mutation including zero entropy positions', async () => {
    mutationProportionDataMock.mockResolvedValue({
      selector: DEFAULT_SELECTOR,
      payload: [{ mutation: 'ORF8:R101C', proportion: 0.3, count: 42 }],
    });

    const { result } = renderHook(() =>
      useNucleotideEntropyDataByPosition(getSelector(DEFAULT_DATE_RANGE), 'aa', false, true)
    );
    await act(() => {});

    expect(result.current).toHaveLength(9814);

    const positionThatHadData = result.current?.find(
      positionEntropy => positionEntropy.position === 'ORF8:R101'
    );
    expect(positionThatHadData).toStrictEqual({
      entropy: 0.6108643020548935,
      original: 'R',
      position: 'ORF8:R101',
      proportions: [
        { mutation: 'C', original: 'R', position: 'ORF8:R101', proportion: 0.3 },
        { mutation: 'R (ref)', original: 'R', position: 'ORF8:R101', proportion: 0.7 },
      ],
    });
  });
});

describe('useNucleotideEntropyDataByTime', () => {
  test('should return undefined if backend request fails', async () => {
    mutationProportionDataMock.mockRejectedValue('no data');

    const { result } = renderHook(() =>
      useNucleotideEntropyDataByTime(getSelector(DEFAULT_DATE_RANGE), 'aa', [ALL_GENES_SELECTED], false)
    );
    await act(() => {});

    expect(result.current).toBe(undefined);
  });

  test('should return no entropy for two mutations that always occur', async () => {
    mutationProportionDataMock.mockResolvedValue({
      selector: DEFAULT_SELECTOR,
      payload: [
        { mutation: 'T670G', proportion: 1, count: 42 },
        { mutation: 'T671G', proportion: 1, count: 42 },
      ],
    });

    const { result } = renderHook(() =>
      useNucleotideEntropyDataByTime(getSelector(DEFAULT_DATE_RANGE), 'nuc', [ALL_GENES_SELECTED], false)
    );
    await act(() => {});

    expect(result.current).toStrictEqual({
      ticks: expectedTicks,
      timeData: [
        {
          All: 0,
          day: expectedTicks[0],
        },
        {
          All: 0,
          day: expectedTicks[1],
        },
      ],
    });
  });

  test('should compute entropy for a mutation', async () => {
    mutationProportionDataMock.mockResolvedValue({
      selector: DEFAULT_SELECTOR,
      payload: [{ mutation: 'T671G', proportion: 0.3, count: 42 }],
    });

    const { result } = renderHook(() =>
      useNucleotideEntropyDataByTime(getSelector(DEFAULT_DATE_RANGE), 'nuc', [ALL_GENES_SELECTED], false)
    );
    await act(() => {});

    expect(result.current).toStrictEqual({
      ticks: expectedTicks,
      timeData: [
        {
          All: 0.000020428194564254205,
          day: expectedTicks[0],
        },
        {
          All: 0.000020428194564254205,
          day: expectedTicks[1],
        },
      ],
    });
  });

  test('should compute entropy for an amino acid mutation', async () => {
    mutationProportionDataMock.mockResolvedValue({
      selector: DEFAULT_SELECTOR,
      payload: [{ mutation: 'ORF8:R101C', proportion: 0.3, count: 42 }],
    });

    const { result } = renderHook(() =>
      useNucleotideEntropyDataByTime(getSelector(DEFAULT_DATE_RANGE), 'aa', [ALL_GENES_SELECTED], false)
    );
    await act(() => {});

    expect(result.current).toStrictEqual({
      ticks: expectedTicks,
      timeData: [
        {
          All: 0.00006224417180098772,
          day: expectedTicks[0],
        },
        {
          All: 0.00006224417180098772,
          day: expectedTicks[1],
        },
      ],
    });
  });

  test('should switch between nucleotide and amino acids', async () => {
    mutationProportionDataMock.mockResolvedValue({
      selector: DEFAULT_SELECTOR,
      payload: [{ mutation: 'T671G', proportion: 0.5, count: 42 }],
    });

    const { result, rerender } = renderHook(
      (sequenceType: SequenceType) =>
        useNucleotideEntropyDataByTime(
          getSelector(DEFAULT_DATE_RANGE),
          sequenceType,
          [ALL_GENES_SELECTED],
          false
        ),
      { initialProps: 'nuc' }
    );
    await act(() => {});

    expect(result.current?.timeData[0]?.All).toBeGreaterThan(0);

    mutationProportionDataMock.mockReset();
    mutationProportionDataMock.mockResolvedValue({
      selector: DEFAULT_SELECTOR,
      payload: [
        { mutation: 'ORF8:R101C', proportion: 1, count: 42 },
        { mutation: 'ORF8:R102C', proportion: 1, count: 42 },
      ],
    });

    await act(() => rerender('aa'));

    expect(result.current?.timeData[0]?.All).toBe(0);
  });
});
