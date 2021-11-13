import { Widget } from './Widget';
import { AsyncZodQueryEncoder } from '../helpers/query-encoder';
import {
  decodeLocationDateVariantSelector,
  encodeLocationDateVariantSelector,
  LocationDateVariantSelectorEncodedSchema,
} from '../data/LocationDateVariantSelector';
import { EstimatedCasesChart, EstimatedCasesChartProps } from './EstimatedCasesChart';
import * as zod from 'zod';
import { DateCountSampleDataset } from '../data/sample/DateCountSampleDataset';
import { CaseCountDataset } from '../data/CaseCountDataset';
import { AsyncDataset } from '../data/AsyncDataset';
import { LocationDateSelector } from '../data/LocationDateSelector';

export const EstimatedCasesChartWidget = new Widget(
  new AsyncZodQueryEncoder(
    LocationDateVariantSelectorEncodedSchema,
    async (decoded: EstimatedCasesChartProps) =>
      encodeLocationDateVariantSelector(decoded.variantDateCounts.getSelector()),
    async (encoded: zod.infer<typeof LocationDateVariantSelectorEncodedSchema>, signal) => {
      const variantSelector = decodeLocationDateVariantSelector(encoded);
      const wholeSelector = {
        ...variantSelector,
        variant: undefined,
      };
      const caseSelector: LocationDateSelector = {
        location: variantSelector.location,
        dateRange: variantSelector.dateRange,
      };
      return {
        variantDateCounts: await DateCountSampleDataset.fromApi(variantSelector, signal),
        wholeDateCounts: await DateCountSampleDataset.fromApi(wholeSelector, signal),
        caseCounts: new AsyncDataset(
          caseSelector,
          (await CaseCountDataset.fromApi(caseSelector, signal)).getPayload(),
          'fulfilled'
        ),
      };
    }
  ),
  EstimatedCasesChart,
  'EstimatedCasesChart'
);
