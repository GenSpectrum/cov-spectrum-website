import { omit, uniqBy } from 'lodash';
import React, { useMemo } from 'react';
import * as zod from 'zod';
import { Plot } from '../components/Plot';
import { globalDateCache } from '../helpers/date-cache';
import { fillWeeklyApiDataNew } from '../helpers/fill-missing';
import { AsyncZodQueryEncoder } from '../helpers/query-encoder';
import { NewSampleSelectorSchema } from '../helpers/sample-selector';
import { SampleSet, SampleSetWithSelector } from '../helpers/sample-set';
import { getNewSamples } from '../services/api';
import { Country, CountrySchema } from '../services/api-types';
import { Widget } from './Widget';

const digitsForPercent = (v: number): string => (v * 100).toFixed(2);

interface Props {
  country: Country;
  logScale?: boolean;
  variantInternationalSampleSet: SampleSetWithSelector;
  wholeInternationalSampleSet: SampleSetWithSelector;
}

const VariantInternationalComparisonPlot = ({
  country,
  logScale,
  variantInternationalSampleSet,
  wholeInternationalSampleSet,
}: Props) => {
  const countriesToPlotList = useMemo(
    () =>
      uniqBy(
        [
          { name: 'United Kingdom', color: 'black' },
          { name: 'Denmark', color: 'green' },
          { name: 'Switzerland', color: 'red' },
          { name: country, color: 'blue' },
        ],
        c => c.name
      ),
    [country]
  );

  const variantSamplesByCountry = useMemo(() => variantInternationalSampleSet.groupByFieldAsMap('country'), [
    variantInternationalSampleSet,
  ]);
  const wholeSamplesByCountry = useMemo(() => wholeInternationalSampleSet.groupByFieldAsMap('country'), [
    wholeInternationalSampleSet,
  ]);

  const plotData = useMemo(() => {
    return countriesToPlotList.map(
      ({ name: country, color }): Plotly.Data => {
        const variantSampleSet = new SampleSet(variantSamplesByCountry.get(country) ?? [], null);
        const wholeSampleSet = new SampleSet(wholeSamplesByCountry.get(country) ?? [], null);

        const dataBeforeFill = variantSampleSet
          .proportionByWeek(wholeSampleSet)
          .filter(e => e.proportion !== undefined)
          .map(e => ({ isoWeek: e.isoWeek, proportion: e.proportion! }));
        const filledData = fillWeeklyApiDataNew(dataBeforeFill, { proportion: 0 }).filter(
          ({ proportion }) => !logScale || proportion > 0
        );

        return {
          name: country,
          marker: { color },
          type: 'scatter',
          mode: 'lines+markers',
          x: filledData.map(({ isoWeek }) => isoWeek.firstDay.string),
          y: filledData.map(({ proportion }) => digitsForPercent(proportion)),
          text: filledData.map(({ proportion }) => `${digitsForPercent(proportion)}%`),
          hovertemplate: '%{text}',
        };
      }
    );
  }, [countriesToPlotList, variantSamplesByCountry, wholeSamplesByCountry, logScale]);

  const xTickVals = useMemo(() => {
    const relevantWeeks = countriesToPlotList.flatMap(({ name }) =>
      (variantSamplesByCountry.get(name) ?? []).map(s => s.date.isoWeek)
    );
    return globalDateCache
      .weeksFromRange(globalDateCache.rangeFromWeeks(relevantWeeks))
      .map(w => w.firstDay.string);
  }, [countriesToPlotList, variantSamplesByCountry]);

  return (
    <div style={{ height: '100%' }}>
      <Plot
        style={{ width: '100%', height: '100%' }}
        data={plotData}
        layout={{
          title: '',
          xaxis: {
            title: 'Week',
            type: 'date',
            tickvals: xTickVals,
            tickformat: 'W%-V, %Y',
            hoverformat: 'Week %-V, %Y (from %d.%m.)',
          },
          yaxis: {
            title: 'Estimated Percentage',
            type: logScale ? 'log' : 'linear',
          },
          legend: {
            x: 0,
            xanchor: 'left',
            y: 1,
          },
          margin: { t: 10 },
        }}
        config={{
          displaylogo: false,
          modeBarButtons: [['zoom2d', 'toImage', 'resetScale2d', 'pan2d']],
          responsive: true,
        }}
      />
    </div>
  );
};

export const VariantInternationalComparisonPlotWidget = new Widget(
  new AsyncZodQueryEncoder(
    zod.object({
      country: CountrySchema,
      logScale: zod.boolean().optional(),
      variantInternationalSampleSelector: NewSampleSelectorSchema,
      wholeInternationalSampleSelector: NewSampleSelectorSchema,
    }),
    async (decoded: Props) => ({
      ...omit(decoded, ['variantInternationalSampleSet', 'wholeInternationalSampleSet']),
      variantInternationalSampleSelector: decoded.variantInternationalSampleSet.sampleSelector,
      wholeInternationalSampleSelector: decoded.wholeInternationalSampleSet.sampleSelector,
    }),
    async (encoded, signal) => ({
      ...omit(encoded, ['variantInternationalSampleSelector', 'wholeInternationalSampleSelector']),
      variantInternationalSampleSet: await getNewSamples(encoded.variantInternationalSampleSelector, signal),
      wholeInternationalSampleSet: await getNewSamples(encoded.wholeInternationalSampleSelector, signal),
    })
  ),
  VariantInternationalComparisonPlot,
  'VariantInternationalComparisonPlot'
);
