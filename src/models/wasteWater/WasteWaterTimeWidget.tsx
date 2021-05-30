import { Widget } from '../../widgets/Widget';
import { AsyncZodQueryEncoder } from '../../helpers/query-encoder';
import WasteWaterTimeChart from './WasteWaterTimeChart';
import { WasteWaterSelectorSchema, WasteWaterTimeseriesSummaryDataset } from './types';
import { filterSingle, getData } from './loading';

interface Props {
  country: string;
  variantName: string;
  location: string;
  data: WasteWaterTimeseriesSummaryDataset;
}

/**
 * This widget is currently not used used on the CoV-Spectrum page itself but will be embedded on external websites.
 */
export const WasteWaterTimeWidget = new Widget(
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
      )!.data.timeseriesSummary,
    })
  ),
  WasteWaterTimeChart,
  'WasteWaterTimeChart'
);
