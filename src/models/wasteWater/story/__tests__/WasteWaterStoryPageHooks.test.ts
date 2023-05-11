import { filterByDateRange, useWasteWaterData } from '../WasteWaterStoryPageHooks';
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

  it('should return unique locations', async function () {
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
    const dates = ['2021-01-01', '2021-01-02', '2021-01-03', '2021-01-04'];

    const unifiedDays = dates.map(date => {
      return globalDateCache.getDay(date);
    });

    const wasteWaterDataWithLocation = [
      {
        location: 'location1',
        variantsTimeseriesSummaries: [
          {
            name: 'variantName1',
            data: unifiedDays.map(date => {
              return {
                date,
                proportion: 0.1,
                proportionCI: [0.1, 0.1],
              } as WasteWaterTimeEntry;
            }),
          },
        ],
      },
    ];

    const filteredData = filterByDateRange(wasteWaterDataWithLocation, {
      dateFrom: globalDateCache.getDay('2021-01-02'),
      dateTo: globalDateCache.getDay('2021-01-03'),
    });

    expect(filteredData[0].variantsTimeseriesSummaries[0].data.length).toEqual(2);
  });
});
