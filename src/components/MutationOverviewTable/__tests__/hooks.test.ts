import { act, renderHook } from '@testing-library/react';
import { useBaselineMutationTableData, useMutationTableData } from '../hooks';
import { SpecialDateRangeSelector } from '../../../data/DateRangeSelector';
import { MutationProportionData } from '../../../data/MutationProportionDataset';
import { LapisSelector } from '../../../data/LapisSelector';

jest.mock('../../../data/api');

const mutationDataFromApiMock: jest.Mock<ReturnType<typeof MutationProportionData.fromApi>> = jest.fn();
MutationProportionData.fromApi = mutationDataFromApiMock;

const variants = [
  { query: { pangoLineage: 'testPangoLineage' }, name: 'testName', description: 'testDescription' },
];
const locationSelector = { country: 'country' };
const dateRangeSelector = new SpecialDateRangeSelector('Past6M');
const mutationType = 'aa';
const baselineVariant = { pangoLineage: 'baselinePangoLineage' };

function mutationTestNameForProportion(proportion: number) {
  return `S:A${proportion}T`;
}

function mutationDataWithPercentageProportions(proportions: number[]) {
  return proportions.map(proportion => ({
    mutation: mutationTestNameForProportion(proportion),
    proportion: proportion / 100,
    count: 0,
  }));
}

beforeEach(() => {
  jest.resetAllMocks();
});

const testCasesForMutationProportions: [string, number[], [string, string, string, string]][] = [
  ['the >90% tile', [100, 95, 91], ['S:A91T, S:A95T, S:A100T', '', '', '']],
  ['the 60-90% tile', [90, 70, 61], ['', 'S:A61T, S:A70T, S:A90T', '', '']],
  ['the 30-60% tile', [60, 40, 31], ['', '', 'S:A31T, S:A40T, S:A60T', '']],
  ['the 5-30% tile', [30, 10, 6], ['', '', '', 'S:A6T, S:A10T, S:A30T']],
  ['no tile', [5, 0], ['', '', '', '']],
];

describe('useMutationTableData', () => {
  test('should return undefined when no data is available', async () => {
    mutationDataFromApiMock.mockRejectedValue('no data');

    const { result } = renderHook(() =>
      useMutationTableData(variants, locationSelector, dateRangeSelector, mutationType)
    );
    await act(() => {});

    expect(result.current).toBe(undefined);
  });

  test.each(testCasesForMutationProportions)(
    'should return data in %s for proportions %p',
    async (_, proportions, expectedColumns) => {
      mutationDataFromApiMock.mockImplementation(selector =>
        Promise.resolve({
          selector,
          payload: mutationDataWithPercentageProportions(proportions),
        })
      );

      const { result } = renderHook(() =>
        useMutationTableData(variants, locationSelector, dateRangeSelector, mutationType)
      );
      await act(() => {});

      expect(result.current).toStrictEqual([
        {
          columns: expectedColumns,
          name: 'testName',
          query: {
            pangoLineage: 'testPangoLineage',
          },
        },
      ]);
    }
  );

  test('should return multiple rows when several variants are given', async () => {
    mutationDataFromApiMock.mockImplementation(selector =>
      Promise.resolve({
        selector,
        payload: mutationDataWithPercentageProportions([42]),
      })
    );

    const variants = [
      { query: { pangoLineage: 'testPangoLineage' }, name: 'name for row 1', description: 'testDescription' },
      { query: { pangoLineage: 'testPangoLineage' }, name: 'name for row 2', description: 'testDescription' },
      { query: { pangoLineage: 'testPangoLineage' }, name: 'name for row 3', description: 'testDescription' },
    ];

    const { result } = renderHook(() =>
      useMutationTableData(variants, locationSelector, dateRangeSelector, mutationType)
    );
    await act(() => {});

    expect(result.current).toHaveLength(variants.length);
    expect(result.current![0].name).toBe('name for row 1');
    expect(result.current![1].name).toBe('name for row 2');
    expect(result.current![2].name).toBe('name for row 3');
  });
});

describe('useBaselineMutationTableData', () => {
  function returnMutationDataFor({
    baselineMutations,
    proportionsOfVariants,
  }: {
    baselineMutations: string[];
    proportionsOfVariants: number[];
  }) {
    return (selector: LapisSelector) => {
      return selector.variant === baselineVariant
        ? Promise.resolve({
            selector,
            payload: baselineMutations.map(baselineMutation => ({
              mutation: baselineMutation,
              proportion: 0.95,
              count: 0,
            })),
          })
        : Promise.resolve({
            selector,
            payload: mutationDataWithPercentageProportions(proportionsOfVariants),
          });
    };
  }

  function baselineMutationsForVariantProportionValues(proportionsOfVariants: number[]) {
    return proportionsOfVariants.map(mutationTestNameForProportion);
  }

  test('should return undefined when no data is present', async () => {
    mutationDataFromApiMock.mockRejectedValue('no data');

    const { result } = renderHook(() =>
      useBaselineMutationTableData(
        variants,
        locationSelector,
        dateRangeSelector,
        baselineVariant,
        mutationType
      )
    );
    await act(() => {});

    expect(result.current).toBe(undefined);
  });

  test.each([
    ['the >90% tile', [1, 5, 10], ['S:A1T, S:A5T, S:A10T', '', '', '']],
    ['the 60-90% tile', [11, 20, 40], ['', 'S:A11T, S:A20T, S:A40T', '', '']],
    ['the 30-60% tile', [41, 50, 70], ['', '', 'S:A41T, S:A50T, S:A70T', '']],
    ['the 5-30% tile', [71, 80, 95], ['', '', '', 'S:A71T, S:A80T, S:A95T']],
    ['no tile', [100, 96, 0], ['', '', '', '']],
  ])(
    'should return missing mutation data in %s for proportions %s',
    async (_, proportions, expectedMutationMissingColumns) => {
      mutationDataFromApiMock.mockImplementation(
        returnMutationDataFor({
          baselineMutations: baselineMutationsForVariantProportionValues(proportions),
          proportionsOfVariants: proportions,
        })
      );

      const { result } = renderHook(() =>
        useBaselineMutationTableData(
          variants,
          locationSelector,
          dateRangeSelector,
          baselineVariant,
          mutationType
        )
      );
      await act(() => {});

      expect(result.current).toStrictEqual([
        {
          additionalMutationColumns: ['', '', '', ''],
          missingMutationColumns: expectedMutationMissingColumns,
          name: 'testName',
          query: { pangoLineage: 'testPangoLineage' },
        },
      ]);
    }
  );

  test.each(testCasesForMutationProportions)(
    'should return additional mutation data in %s for proportions %s',
    async (_, proportions, expectedAdditionalMutationColumns) => {
      mutationDataFromApiMock.mockImplementation(
        returnMutationDataFor({
          baselineMutations: baselineMutationsForVariantProportionValues([500]),
          proportionsOfVariants: proportions,
        })
      );

      const { result } = renderHook(() =>
        useBaselineMutationTableData(
          variants,
          locationSelector,
          dateRangeSelector,
          baselineVariant,
          mutationType
        )
      );
      await act(() => {});

      expect(result.current).toStrictEqual([
        {
          additionalMutationColumns: expectedAdditionalMutationColumns,
          missingMutationColumns: ['', '', '', ''],
          name: 'testName',
          query: { pangoLineage: 'testPangoLineage' },
        },
      ]);
    }
  );

  test('should return multiple rows when several variants are given', async () => {
    mutationDataFromApiMock.mockImplementation(
      returnMutationDataFor({
        baselineMutations: baselineMutationsForVariantProportionValues([]),
        proportionsOfVariants: [],
      })
    );

    const variants = [
      { query: { pangoLineage: 'testPangoLineage' }, name: 'name for row 1', description: 'testDescription' },
      { query: { pangoLineage: 'testPangoLineage' }, name: 'name for row 2', description: 'testDescription' },
    ];

    const { result } = renderHook(() =>
      useBaselineMutationTableData(
        variants,
        locationSelector,
        dateRangeSelector,
        baselineVariant,
        mutationType
      )
    );
    await act(() => {});

    expect(result.current).toHaveLength(variants.length);
    expect(result.current![0].name).toBe('name for row 1');
    expect(result.current![1].name).toBe('name for row 2');
  });
});
