import { Widget } from '../../widgets/Widget';
import { AsyncZodQueryEncoder } from '../../helpers/query-encoder';
import WasteWaterTimeChart from './WasteWaterTimeChart';
import { WasteWaterSelectorSchema, WasteWaterTimeseriesSummaryDataset } from './types';
import { getData } from './loading';

interface Props {
  country: string;
  variantName: string;
  location: string;
  data: WasteWaterTimeseriesSummaryDataset;
}

export const WasteWaterTimeWidget = new Widget(
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
      data: (await getData({
        country: encoded.country,
        variantName: encoded.variantName,
      }))!.data.filter(({ location }) => location === encoded.location)[0].timeseriesSummary,
    })
  ),
  WasteWaterTimeChart,
  'WasteWaterTimeChart'
);
