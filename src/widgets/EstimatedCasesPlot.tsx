import { SampleSetWithSelector } from '../helpers/sample-set';
import {
  SequencingIntensityEntrySetSelectorSchema,
  SequencingIntensityEntrySetWithSelector,
} from '../helpers/sequencing-intensity-entry-set';
import { EstimatedCasesChart, EstimatedCasesTimeEntry } from '../charts/EstimatedCasesChart';
import { globalDateCache, UnifiedDay } from '../helpers/date-cache';
import { Widget } from './Widget';
import { AsyncZodQueryEncoder } from '../helpers/query-encoder';
import * as zod from 'zod';
import { NewSampleSelectorSchema } from '../helpers/sample-selector';
import { getNewSamples, getSequencingIntensity } from '../services/api';

interface Props {
  variantSampleSet: SampleSetWithSelector;
  sequencingIntensityEntrySet: SequencingIntensityEntrySetWithSelector;
}

export const EstimatedCasesPlot = ({ variantSampleSet, sequencingIntensityEntrySet }: Props) => {
  const data: Map<UnifiedDay, EstimatedCasesTimeEntry> = new Map();
  for (let entry of sequencingIntensityEntrySet.data) {
    const date = globalDateCache.getDay(entry.x);
    data.set(date, {
      date,
      cases: entry.y.numberCases,
      sequenced: entry.y.numberSequenced,
      variantCount: 0,
    });
  }
  const variantCounts = variantSampleSet.countByDate();
  for (let [unifiedDay, count] of variantCounts.entries()) {
    const entry = data.get(unifiedDay);
    if (!entry) {
      // TODO This should never happen and indicate an error with the data. Once we have a error reporting system,
      //   this could be reported?
      continue;
    }
    entry.variantCount = count;
  }
  return <EstimatedCasesChart data={new Array(...data.values())} />;
};

export const EstimatedCasesPlotWidget = new Widget(
  new AsyncZodQueryEncoder(
    zod.object({
      variantSampleSelector: NewSampleSelectorSchema,
      sequencingIntensityEntrySetSelector: SequencingIntensityEntrySetSelectorSchema,
    }),
    async (decoded: Props) => ({
      variantSampleSelector: decoded.variantSampleSet.sampleSelector,
      sequencingIntensityEntrySetSelector: decoded.sequencingIntensityEntrySet.selector,
    }),
    async (encoded, signal) => ({
      variantSampleSet: await getNewSamples(encoded.variantSampleSelector, signal),
      sequencingIntensityEntrySet: await getSequencingIntensity(
        encoded.sequencingIntensityEntrySetSelector,
        signal
      ),
    })
  ),
  EstimatedCasesPlot,
  'EstimatedCasesPlot'
);
