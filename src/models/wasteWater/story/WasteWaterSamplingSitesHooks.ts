import { WasteWaterDataset, WasteWaterTimeEntry } from '../types';
import { useEffect, useMemo, useState } from 'react';
import { getData } from '../loading';
import { Utils } from '../../../services/Utils';
import { sortBy } from '../../../helpers/lodash_alternatives';
import { DateRange, isInDateRange } from '../../../data/DateRange';
import dayjs from 'dayjs';

export interface WasteWaterDataWithLocation {
  variantsTimeseriesSummaries: {
    data: WasteWaterTimeEntry[];
    name: string;
  }[];
  location: string;
}

export function useWasteWaterData(): WasteWaterDataWithLocation[] | undefined {
  const [wasteWaterData, setWasteWaterData] = useState<WasteWaterDataset | undefined>(undefined);
  useEffect(() => {
    getData({
      country: 'Switzerland',
    }).then(dataset => dataset && setWasteWaterData(dataset));
  }, []);

  const locationData = useMemo(() => {
    if (!wasteWaterData) {
      return undefined;
    }
    const locationGrouped = [...Utils.groupBy(wasteWaterData, d => d.location).values()]
      .concat()
      .sort(sortBy('location'));

    return locationGrouped.map(data => {
      const location = data[0].location;
      const variantsTimeseriesSummaries = data.map(({ variantName, data }) => ({
        name: variantName,
        data: data.timeseriesSummary,
      }));
      return { location, variantsTimeseriesSummaries };
    });
  }, [wasteWaterData]);

  return locationData;
}

export function filterByDateRange(
  wasteWaterData: WasteWaterDataWithLocation[],
  dateRange: DateRange
): WasteWaterDataWithLocation[] {
  return wasteWaterData.map(({ location, variantsTimeseriesSummaries }) => ({
    location,
    variantsTimeseriesSummaries: variantsTimeseriesSummaries.map(({ name, data }) => ({
      name,
      data: data.filter(timeEntry => {
        return isInDateRange(dateRange, timeEntry.date);
      }),
    })),
  }));
}

export function getMaxDateRange(wasteWaterData: WasteWaterDataWithLocation[]) {
  const allDates = wasteWaterData
    .flatMap(({ variantsTimeseriesSummaries }) => variantsTimeseriesSummaries)
    .flatMap(({ data }) => data)
    .map(({ date }) => date);

  const minDate = dayjs.min(allDates.map(date => date.dayjs));
  const maxDate = dayjs.max(allDates.map(date => date.dayjs));

  const dateFrom = allDates.find(date => date.dayjs.isSame(minDate));
  const dateTo = allDates.find(date => date.dayjs.isSame(maxDate));

  return { dateFrom, dateTo };
}
