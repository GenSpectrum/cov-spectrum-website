import { Widget } from './Widget';
import { AsyncZodQueryEncoder } from '../helpers/query-encoder';
import { SequencingIntensityEntrySetSelectorSchema } from '../helpers/sequencing-intensity-entry-set';
import { SequencingRepresentativenessSelector } from '../services/api-types';
import { useEffect } from 'react';
import { getCaseCounts } from '../services/api';

interface Props {
  selector: SequencingRepresentativenessSelector;
}

export const SequencingRepresentativenessPlot = ({ selector }: Props) => {
  useEffect(() => {
    getCaseCounts(selector).then(caseCounts => console.log(caseCounts));
  }, [selector]);
  return <></>;
};

export const SequencingRepresentativenessPlotWidget = new Widget(
  new AsyncZodQueryEncoder(
    SequencingIntensityEntrySetSelectorSchema,
    async (decoded: Props) => decoded.selector,
    async encoded => ({
      selector: encoded,
    })
  ),
  SequencingRepresentativenessPlot,
  'SequencingRepresentativenessPlot'
);
