import { omit, uniqBy } from 'lodash';
import React, { useMemo } from 'react';
import * as zod from 'zod';
import { Plot } from '../components/Plot';
import { globalDateCache, UnifiedIsoWeek } from '../helpers/date-cache';
import { fillFromWeeklyMap } from '../helpers/fill-missing';
import { AsyncZodQueryEncoder } from '../helpers/query-encoder';
import { NewSampleSelectorSchema } from '../helpers/sample-selector';
import { SampleSet, SampleSetWithSelector } from '../helpers/sample-set';
import { getNewSamples } from '../services/api';
import { Country, CountrySchema } from '../services/api-types';
import { Widget } from './Widget';
import { ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartAndMetricsWrapper, ChartWrapper, colors, Wrapper } from '../charts/common';
import Metric, { MetricsSpacing, MetricsWrapper } from '../charts/Metrics';
import Select from 'react-select';

const digitsForPercent = (v: number): string => (v * 100).toFixed(2);

const CHART_MARGIN_RIGHT = 15;
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

  const variantSamplesByCountry = useMemo(() => variantInternationalSampleSet.groupByField('country'), [
    variantInternationalSampleSet,
  ]);
  const wholeSamplesByCountry = useMemo(() => wholeInternationalSampleSet.groupByField('country'), [
    wholeInternationalSampleSet,
  ]);

  const plotData = useMemo(() => {
    console.log("Variant samples by country", variantSamplesByCountry)
    console.log("Whole samples by country", wholeSamplesByCountry)
    // console.log('Variant samples set', variantSampleSet);
    interface ProportionCountry {
      countryName: string;
      data: {
        dateString: string;
        proportion: number;
      }[];
    }
    const proportionCountries: ProportionCountry[] = countriesToPlotList.map(
      ({ name: country }) => {
        const variantSampleSet = new SampleSet(variantSamplesByCountry.get(country) ?? [], null);
        const wholeSampleSet = new SampleSet(wholeSamplesByCountry.get(country) ?? [], null);
        const filledData = fillFromWeeklyMap(variantSampleSet.proportionByWeek(wholeSampleSet), {
          count: 0,
          proportion: 0,
        })
          .filter(({ value: { proportion } }) => proportion !== undefined && (!logScale || proportion > 0))
          .map(({ value: { proportion, ...restValue }, key }) => ({
            key,
            value: { ...restValue, proportion: proportion! },
          }));
          console.log("international filled data", filledData)
        return {
          countryName: country,
          data: filledData.map((entry) => ({
            dateString: entry.key.firstDay.string,
            proportion: entry.value.proportion
          }))
        };
      }
      );
      
      const dateMap: Map<string, any> = new Map();

      for (let {countryName, data} of proportionCountries) {
          for (let {dateString, proportion} of data) {
            if (!dateMap.has(dateString)) {
              dateMap.set(dateString, {
                dateString,
              });
            }
              dateMap.get(dateString)[countryName] = Math.max(proportion, 0);
          }
      }
  
      return [...dateMap.values()].sort((a, b) => Date.parse(a.dateString) - Date.parse(b.dateString));
  }, [countriesToPlotList, variantSamplesByCountry, wholeSamplesByCountry, logScale]);

  


  const xTickVals = useMemo(() => {
    const relevantWeeks = countriesToPlotList.flatMap(({ name }) =>
      (variantSamplesByCountry.get(name) ?? []).map(s => s.date.isoWeek)
    );
    return globalDateCache
      .weeksFromRange(globalDateCache.rangeFromWeeks(relevantWeeks))
      .map(w => w.firstDay.string);
  }, [countriesToPlotList, variantSamplesByCountry]);


  const options = [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'vanilla', label: 'Vanilla' },
  ];


  const proportionData = [
    [
      {
        date: '1',
        proportion: 12,
      },
      {
        date: '2',
        proportion: 10,
      },
    ],
  ];


  return (
    <Wrapper>
      <Select
        closeMenuOnSelect={false}
        // defaultValue={[colourOptions[0], colourOptions[1]]}
        placeholder='Select countries...'
        isMulti
        options={options}
        // styles={colourStyles}
      />
      <ChartAndMetricsWrapper>
        <ChartWrapper>
          <ResponsiveContainer>
            <ComposedChart
              data={proportionData}
              margin={{ top: 6, right: CHART_MARGIN_RIGHT, left: 0, bottom: 0 }}
            >
              <XAxis
                dataKey='date'
                scale='time'
                type='number'
              />
              <YAxis dataKey="proportion" domain={['dataMin', 'auto']} />
              <Tooltip
                formatter={(value: any, name: any, props: any) => (value * 100).toFixed(2) + '%'}
                labelFormatter={label => {
                  return 'Date: ';
                }}
              />
                <Line dataKey="date" />
              {/* {plotData.map(location => (
              ))} */}
            </ComposedChart>
          </ResponsiveContainer>
        </ChartWrapper>
        <MetricsWrapper>
          <MetricsSpacing />
          <Metric
            value={variantSamplesByCountry.size}
            title={'Countries'}
            helpText={'The number of countries in which the variant was detected'}
            color={colors.active}
          />
        </MetricsWrapper>
      </ChartAndMetricsWrapper>
    </Wrapper>
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

// const plotData = useMemo(() => {
//   console.log('Variant samples by country', variantSamplesByCountry);
//   console.log('Whole samples by country', wholeSamplesByCountry);
//   // console.log('Variant samples set', variantSampleSet);
//   const mappedVals = countriesToPlotList.map(
//     ({ name: country, color }): Plotly.Data => {
//       const variantSampleSet = new SampleSet(variantSamplesByCountry.get(country) ?? [], null);
//       const wholeSampleSet = new SampleSet(wholeSamplesByCountry.get(country) ?? [], null);
//       const filledData = fillFromWeeklyMap(variantSampleSet.proportionByWeek(wholeSampleSet), {
//         count: 0,
//         proportion: 0,
//       })
//         .filter(({ value: { proportion } }) => proportion !== undefined && (!logScale || proportion > 0))
//         .map(({ value: { proportion, ...restValue }, key }) => ({
//           key,
//           value: { ...restValue, proportion: proportion! },
//         }));
//       // console.log("international filled data")
//       return {
//         name: country,
//         marker: { color },
//         type: 'scatter',
//         mode: 'lines+markers',
//         x: filledData.map(({ key }) => key.firstDay.string),
//         y: filledData.map(({ value: { proportion } }) => digitsForPercent(proportion)),
//         text: filledData.map(({ value: { proportion } }) => `${digitsForPercent(proportion)}%`),
//         hovertemplate: '%{text}',
//       };
//     }
//   );
//   console.log('Mapped values international are...');
//   console.log(mappedVals);
//   return mappedVals;
// }, [countriesToPlotList, variantSamplesByCountry, wholeSamplesByCountry, logScale]);
