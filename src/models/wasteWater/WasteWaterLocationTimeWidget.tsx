import { Widget } from '../../widgets/Widget';
import { AsyncZodQueryEncoder } from '../../helpers/query-encoder';
import * as zod from 'zod';
import { filter, getData } from './loading';
import { WasteWaterTimeseriesSummaryDataset } from './types';
import { WasteWaterLocationTimeChart } from './WasteWaterLocationTimeChart';
import { DateRange } from '../../data/DateRange';

interface Props {
  country: string;
  location: string;
  variants: {
    name: string;
    data: WasteWaterTimeseriesSummaryDataset;
  }[];
  dateRange: DateRange;
}

export const WasteWaterLocationTimeWidget = new Widget(
  new AsyncZodQueryEncoder(
    zod.object({
      country: zod.string(),
      location: zod.string(),
    }),
    async ({ country, location, dateRange }: Props) => ({
      country,
      location,
      dateRange,
    }),
    async encoded => ({
      country: encoded.country,
      location: encoded.location,
      dateRange: encoded.dateRange,
      variants: filter(
        (await getData({
          country: encoded.country,
        }))!,
        undefined,
        encoded.location
      ).map(entry => ({
        name: entry.variantName,
        data: entry.data.timeseriesSummary,
      })),
    })
  ),
  WasteWaterLocationTimeChart,
  'WasteWaterLocationTimeChart'
);
