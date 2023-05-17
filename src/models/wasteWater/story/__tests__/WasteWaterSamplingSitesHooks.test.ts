import {
  filterByDateRange,
  getMaxDateRange,
  useWasteWaterData,
  WasteWaterDataWithLocation,
} from '../WasteWaterSamplingSitesHooks';
import { getData } from '../../loading';
import { renderHook, waitFor } from '@testing-library/react';
import { WasteWaterTimeEntry } from '../../types';
import { globalDateCache } from '../../../../helpers/date-cache';

jest.mock('../../loading');
const getDataMock = getData as jest.Mock;

describe('useWasteWaterData', function () {
  beforeEach(() => {
    getDataMock.mockReset();
  });

  it('should return unique locations for entries with different variants', async function () {
    const variants = ['variantName1', 'variantName2'];

    const wasteWaterDatasetWithOneLocation = variants.map(variant => {
      return {
        location: 'location1',
        variantName: variant,
        data: {
          timeseriesSummary: [
            {
              date: '2021-01-01',
              proportion: 0.1,
              proportionCI: [0.1, 0.1],
            },
          ],
        },
      };
    });

    getDataMock.mockResolvedValue(wasteWaterDatasetWithOneLocation);

    const { result } = renderHook(() => useWasteWaterData());
    expect(result.current).toBeUndefined();

    await waitFor(() => {
      expect(result.current).toBeDefined();
    });

    if (!result.current) {
      throw new Error('data is undefined');
    }
    expect(result.current.length).toEqual(1);
    expect(result.current[0].location).toEqual('location1');
  });
});

describe('filterByDateRange', function () {
  it('should filter data by date range', function () {
    const wasteWaterDataWithLocation = getTestWasteWaterDataWithLocation([
      '2021-01-01',
      '2021-01-02',
      '2021-01-03',
      '2021-01-04',
    ]);

    const filteredData = filterByDateRange(wasteWaterDataWithLocation, {
      dateFrom: globalDateCache.getDay('2021-01-02'),
      dateTo: globalDateCache.getDay('2021-01-03'),
    });

    expect(filteredData[0].variantsTimeseriesSummaries[0].data.length).toEqual(2);
  });
});

export function getTestWasteWaterDataWithLocation(
  dates = ['2021-01-01', '2021-01-02', '2021-01-03', '2021-01-04'],
  variants = ['variantName1'],
  locations = ['location1']
): WasteWaterDataWithLocation[] {
  const unifiedDays = dates.map(date => {
    return globalDateCache.getDay(date);
  });

  return locations.map(location => {
    return {
      location: location,
      variantsTimeseriesSummaries: variants.map(variant => {
        return {
          name: variant,
          data: unifiedDays.map(date => {
            return {
              date,
              proportion: 0.1,
              proportionCI: [0.1, 0.1],
            } as WasteWaterTimeEntry;
          }),
        };
      }),
    };
  });
}

describe('getMaxDateRange', function () {
  it('should return minimum and maximum date of wasteWaterData', function () {
    const wasteWaterDataWithLocation = getTestWasteWaterDataWithLocation([
      '2021-01-01',
      '2021-01-02',
      '2021-01-03',
      '2021-01-04',
    ]);

    const dateRange = getMaxDateRange(wasteWaterDataWithLocation);
    expect(dateRange.dateFrom).toEqual(globalDateCache.getDay('2021-01-01'));
    expect(dateRange.dateTo).toEqual(globalDateCache.getDay('2021-01-04'));
  });

  it('should return undefined if wasteWaterData is empty', function () {
    const dateRange = getMaxDateRange([]);
    expect(dateRange.dateTo).toBeUndefined();
    expect(dateRange.dateFrom).toBeUndefined();
  });

  it('should return undefined if data is empty', function () {
    const wasteWaterDataWithLocation = getTestWasteWaterDataWithLocation([]);
    const dateRange = getMaxDateRange(wasteWaterDataWithLocation);
    expect(dateRange.dateTo).toBeUndefined();
    expect(dateRange.dateFrom).toBeUndefined();
  });
});
