import { act, renderHook } from '@testing-library/react';
import { useNucleotideEntropyDataByPosition, useNucleotideEntropyDataByTime } from '../hooks';
import { MutationProportionData } from '../../../data/MutationProportionDataset';
import { SamplingStrategy } from '../../../data/SamplingStrategy';
import { addDefaultHostAndQc } from '../../../data/HostAndQcSelector';
import { FixedDateRangeSelector } from '../../../data/DateRangeSelector';
import { globalDateCache } from '../../../helpers/date-cache';
import { DateRange } from '../../../data/DateRange';

jest.mock('../../../data/api');

let mutationProportionDataMock = jest.fn() as jest.Mock<ReturnType<typeof MutationProportionData.fromApi>>;
MutationProportionData.fromApi = mutationProportionDataMock;

beforeEach(() => {
  jest.resetAllMocks();
});

const DEFAULT_SELECTOR = {
  location: {},
  samplingStrategy: SamplingStrategy.AllSamples,
};

const ALL_GENES_SELECTED = {
  value: 'All',
  label: 'All',
  startPosition: 0,
  endPosition: 29903,
  aaSeq: '',
  color: 'some color',
};

function getSelector(dateRange: DateRange) {
  return addDefaultHostAndQc({
    location: {},
    samplingStrategy: SamplingStrategy.AllSamples,
    dateRange: new FixedDateRangeSelector(dateRange),
  });
}

describe('useNucleotideEntropyDataByPosition', () => {
  test('should return undefined if backend request fails', async () => {
    mutationProportionDataMock.mockRejectedValue('no data');

    const { result } = renderHook(() =>
      useNucleotideEntropyDataByPosition(
        getSelector({
          dateFrom: globalDateCache.getDay('2023-05-01'),
          dateTo: globalDateCache.getDay('2023-05-15'),
        }),
        'aa',
        false,
        false
      )
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
      useNucleotideEntropyDataByPosition(
        getSelector({
          dateFrom: globalDateCache.getDay('2023-05-01'),
          dateTo: globalDateCache.getDay('2023-05-15'),
        }),
        'nuc',
        false,
        false
      )
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
      useNucleotideEntropyDataByPosition(
        getSelector({
          dateFrom: globalDateCache.getDay('2023-05-01'),
          dateTo: globalDateCache.getDay('2023-05-15'),
        }),
        'nuc',
        false,
        false
      )
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
      useNucleotideEntropyDataByPosition(
        getSelector({
          dateFrom: globalDateCache.getDay('2023-05-01'),
          dateTo: globalDateCache.getDay('2023-05-15'),
        }),
        'nuc',
        false,
        true
      )
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
      useNucleotideEntropyDataByPosition(
        getSelector({
          dateFrom: globalDateCache.getDay('2023-05-01'),
          dateTo: globalDateCache.getDay('2023-05-15'),
        }),
        'aa',
        false,
        false
      )
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

  test('should compute entropy for an amino acid mutation including zero entropy positions', async () => {
    mutationProportionDataMock.mockResolvedValue({
      selector: DEFAULT_SELECTOR,
      payload: [{ mutation: 'ORF8:R101C', proportion: 0.3, count: 42 }],
    });

    const { result } = renderHook(() =>
      useNucleotideEntropyDataByPosition(
        getSelector({
          dateFrom: globalDateCache.getDay('2023-05-01'),
          dateTo: globalDateCache.getDay('2023-05-15'),
        }),
        'aa',
        false,
        true
      )
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
      useNucleotideEntropyDataByTime(
        getSelector({
          dateFrom: globalDateCache.getDay('2023-05-01'),
          dateTo: globalDateCache.getDay('2023-05-15'),
        }),
        'aa',
        [ALL_GENES_SELECTED],
        false
      )
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
      useNucleotideEntropyDataByTime(
        getSelector({
          dateFrom: globalDateCache.getDay('2023-05-01'),
          dateTo: globalDateCache.getDay('2023-05-15'),
        }),
        'nuc',
        [ALL_GENES_SELECTED],
        false
      )
    );
    await act(() => {});

    expect(result.current).toStrictEqual({
      ticks: [1682892000000, 1683496800000, 1684101600000],
      timeData: [
        {
          All: 0,
          day: 1682892000000,
        },
        {
          All: 0,
          day: 1683496800000,
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
      useNucleotideEntropyDataByTime(
        getSelector({
          dateFrom: globalDateCache.getDay('2023-05-01'),
          dateTo: globalDateCache.getDay('2023-05-15'),
        }),
        'nuc',
        [ALL_GENES_SELECTED],
        false
      )
    );
    await act(() => {});

    expect(result.current).toStrictEqual({
      ticks: [1682892000000, 1683496800000, 1684101600000],
      timeData: [
        {
          All: 0.000020428194564254205,
          day: 1682892000000,
        },
        {
          All: 0.000020428194564254205,
          day: 1683496800000,
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
      useNucleotideEntropyDataByTime(
        getSelector({
          dateFrom: globalDateCache.getDay('2023-05-01'),
          dateTo: globalDateCache.getDay('2023-05-15'),
        }),
        'aa',
        [ALL_GENES_SELECTED],
        false
      )
    );
    await act(() => {});

    expect(result.current).toStrictEqual({
      ticks: [1682892000000, 1683496800000, 1684101600000],
      timeData: [
        {
          All: 0.00006224417180098772,
          day: 1682892000000,
        },
        {
          All: 0.00006224417180098772,
          day: 1683496800000,
        },
      ],
    });
  });
});
