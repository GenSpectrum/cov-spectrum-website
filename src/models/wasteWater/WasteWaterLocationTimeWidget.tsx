import { Widget } from '../../widgets/Widget';
import { AsyncZodQueryEncoder } from '../../helpers/query-encoder';
import * as zod from 'zod';
import { filter, getData } from './loading';
import { WasteWaterTimeseriesSummaryDataset } from './types';
import { WasteWaterLocationTimeChart } from './WasteWaterLocationTimeChart';

interface Props {
  country: string;
  location: string;
  variants: {
    name: string;
    data: WasteWaterTimeseriesSummaryDataset;
  }[];
}

export const WasteWaterLocationTimeWidget = new Widget(
  new AsyncZodQueryEncoder(
    zod.object({
      country: zod.string(),
      location: zod.string(),
    }),
    async ({ country, location }: Props) => ({
      country,
      location,
    }),
    async encoded => ({
      country: encoded.country,
      location: encoded.location,
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
