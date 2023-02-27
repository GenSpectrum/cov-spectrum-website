import { SamplingStrategy } from '../../../data/SamplingStrategy';
import { useOverlappingData } from '../VariantMutationComparisonHook';
import { LapisSelector } from '../../../data/LapisSelector';
import { defaultSubmissionDateRangeSelector } from '../../../data/DateRangeSelector';
import { renderHook } from '@testing-library/react';
import { useQuery } from '../../../helpers/query-hook';
import { ReferenceGenomeService } from '../../../services/ReferenceGenomeService';

jest.mock('../../../data/api');

jest.mock('../../../helpers/query-hook');
const useQueryMock = useQuery as jest.Mock;

const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('VariantMutationComparisonHook', () => {
  beforeEach(() => {
    useQueryMock.mockReset();
  });

  const someSelector: LapisSelector = {
    location: {},
    qc: {},
    host: undefined,
    variant: undefined,
    dateRange: undefined,
    submissionDate: defaultSubmissionDateRangeSelector,
    samplingStrategy: SamplingStrategy.AllSamples,
  };

  test('should throw an error if not exactly two selectors are provided', () => {
    setUseQueryResult([], []);

    const numberOfSelectors = [0, 1, 3];
    numberOfSelectors.forEach(numberOfSelector => {
      const selectors = Array(numberOfSelector).fill(someSelector);

      expect(() =>
        renderHook(() => {
          return useOverlappingData(selectors, 0.123);
        })
      ).toThrow();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  test('should return loading if data is not available', () => {
    useQueryMock.mockReturnValue({
      isLoading: true,
      isSuccess: true,
      isError: false,
      error: undefined,
      data: [],
    });

    const result = renderHook(() => {
      return useOverlappingData([someSelector, someSelector], 0.5);
    }).result.current;

    expect(result).toBe('loading');
  });

  function setUseQueryResult(
    payloadSelector1: { mutation: string; proportion: number; count: number }[],
    payloadSelector2: { mutation: string; proportion: number; count: number }[]
  ) {
    useQueryMock.mockReturnValue({
      isLoading: false,
      isSuccess: true,
      isError: false,
      error: undefined,
      data: [
        { selector: someSelector, payload: payloadSelector1 },
        { selector: someSelector, payload: payloadSelector2 },
      ],
    });
  }

  test('should select shared and unique mutations', () => {
    const mutationsOfSelector1 = ['E:ABC', 'N:ABC'];
    const mutationsOfSelector2 = ['E:DEF', 'N:ABC', 'N:DEF'];

    const proportion = 0.567;
    const payloadSelector1 = mutationsOfSelector1.map(mutation => ({
      mutation: mutation,
      proportion: proportion,
      count: 123,
    }));
    const payloadSelector2 = mutationsOfSelector2.map(mutation => ({
      mutation: mutation,
      proportion: proportion,
      count: 123,
    }));

    setUseQueryResult(payloadSelector1, payloadSelector2);

    const result = renderHook(() => {
      return useOverlappingData([someSelector, someSelector], 0.123);
    }).result.current;

    expect(result).toHaveLength(ReferenceGenomeService.genes.length);
    expect(result).toContainEqual({
      mutationsOnlyIn1: ['E:ABC'],
      mutationsOnlyIn2: ['E:DEF'],
      sharedMutations: [],
      gene: 'E',
    });
    expect(result).toContainEqual({
      mutationsOnlyIn1: [],
      mutationsOnlyIn2: ['N:DEF'],
      sharedMutations: ['N:ABC'],
      gene: 'N',
    });
  });

  test('should select shared mutations also if one list is empty', () => {
    const mutationsOfSelector1: string[] = [];
    const mutationsOfSelector2 = ['E:ABC'];

    const proportion = 0.567;
    const payloadSelector1 = mutationsOfSelector1.map(mutation => ({
      mutation: mutation,
      proportion: proportion,
      count: 123,
    }));
    const payloadSelector2 = mutationsOfSelector2.map(mutation => ({
      mutation: mutation,
      proportion: proportion,
      count: 123,
    }));

    setUseQueryResult(payloadSelector1, payloadSelector2);

    const result = renderHook(() => {
      return useOverlappingData([someSelector, someSelector], 0.123);
    }).result.current;

    expect(result).toHaveLength(ReferenceGenomeService.genes.length);
    expect(result).toContainEqual({
      mutationsOnlyIn1: [],
      mutationsOnlyIn2: ['E:ABC'],
      sharedMutations: [],
      gene: 'E',
    });
  });

  test('should select only mutations above threshold', () => {
    const proportionThreshold = 0.7;
    const proportionBelowThreshold = 0.5;
    const proportionAboveThreshold = 0.8;

    const payloadSelector = [
      { mutation: 'E:ABC', proportion: proportionBelowThreshold, count: 123 },
      { mutation: 'E:DEF', proportion: proportionAboveThreshold, count: 123 },
    ];
    setUseQueryResult(payloadSelector, payloadSelector);

    const result = renderHook(() => {
      return useOverlappingData([someSelector, someSelector], proportionThreshold);
    }).result.current;

    expect(result).toHaveLength(ReferenceGenomeService.genes.length);
    expect(result).toContainEqual({
      mutationsOnlyIn1: [],
      mutationsOnlyIn2: [],
      sharedMutations: ['E:DEF'],
      gene: 'E',
    });
  });
});
