import { Widget } from '../../widgets/Widget';
import { AsyncZodQueryEncoder } from '../../helpers/query-encoder';
import { WasteWaterMutationOccurrencesDataset, WasteWaterSelectorSchema } from './types';
import { getData } from './loading';
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
    async (encoded, signal) => ({
      country: encoded.country,
      variantName: encoded.variantName,
      location: encoded.location,
      data: (
        await getData({
          country: encoded.country,
          variantName: encoded.variantName,
        })
      ).data.filter(({ location }) => location === encoded.location)[0].mutationOccurrences,
    })
  ),
  WasteWaterHeatMapChart,
  'WasteWaterHeatMapChart'
);
