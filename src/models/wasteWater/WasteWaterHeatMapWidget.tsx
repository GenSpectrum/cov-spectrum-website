import { Widget } from '../../widgets/Widget';
import { AsyncZodQueryEncoder } from '../../helpers/query-encoder';
import { WasteWaterMutationOccurrencesDataset, WasteWaterSelectorSchema } from './types';
import { filterSingle, getData } from './loading';
import WasteWaterHeatMapChart from './WasteWaterHeatMapChart';

interface Props {
  country: string;
  variantName: string;
  location: string;
  data: WasteWaterMutationOccurrencesDataset;
}

export const WasteWaterHeatMapWidget = new Widget(
  new AsyncZodQueryEncoder(
    WasteWaterSelectorSchema,
    async ({ country, variantName, location }: Props) => ({
      country,
      variantName,
      location,
    }),
    async encoded => ({
      country: encoded.country,
      variantName: encoded.variantName,
      location: encoded.location,
      data: filterSingle(
        (await getData({
          country: encoded.country,
        }))!,
        encoded.variantName,
        encoded.location
      )!.data.mutationOccurrences,
    })
  ),
  WasteWaterHeatMapChart,
  'WasteWaterHeatMapChart'
);
