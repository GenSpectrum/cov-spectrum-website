import { Widget } from '../../widgets/Widget';
import { AsyncZodQueryEncoder } from '../../helpers/query-encoder';
import { WasteWaterTimeseriesSummaryDataset } from './types';
import { getData } from './loading';
import WasteWaterSummaryTimeChart from './WasteWaterSummaryTimeChart';
import * as zod from 'zod';

interface Props {
  country: string;
  variantName: string;
  wasteWaterPlants: {
    location: string;
    data: WasteWaterTimeseriesSummaryDataset;
  }[];
}

export const WasteWaterSummaryTimeWidget = new Widget(
  new AsyncZodQueryEncoder(
    zod.object({
      country: zod.string(),
      variantName: zod.string(),
    }),
    async ({ country, variantName }: Props) => ({
      country,
      variantName,
    }),
    async encoded => ({
      country: encoded.country,
      variantName: encoded.variantName,
      wasteWaterPlants: (await getData({
        country: encoded.country,
        variantName: encoded.variantName,
      }))!.data.map(({ location, timeseriesSummary }) => ({
        location,
        data: timeseriesSummary,
      })),
    })
  ),
  WasteWaterSummaryTimeChart,
  'WasteWaterSummaryTimeChart'
);
