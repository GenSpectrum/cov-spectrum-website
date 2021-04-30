import { omit, uniqBy } from 'lodash';
import React, { useMemo, useState } from 'react';
import * as zod from 'zod';
import { globalDateCache } from '../helpers/date-cache';
import { fillFromWeeklyMap } from '../helpers/fill-missing';
import { AsyncZodQueryEncoder } from '../helpers/query-encoder';
import { NewSampleSelectorSchema } from '../helpers/sample-selector';
import { SampleSet, SampleSetWithSelector } from '../helpers/sample-set';
import { getNewSamples } from '../services/api';
import { Country, CountrySchema } from '../services/api-types';
import { Widget } from './Widget';
import { ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartAndMetricsWrapper, ChartWrapper, Wrapper } from '../charts/common';
import Select , {Styles, StylesConfig} from 'react-select';
import chroma from 'chroma-js';
import styled, { CSSPseudos } from 'styled-components';

const CHART_MARGIN_RIGHT = 15;
const MAX_SELECT = 6;

 interface PlaceOption {
   value: string;
   label: string;
   color: string;
   isFixed: boolean;
 }

const colourStyles: Partial<Styles<any, true, any>> = {
  control: (styles: CSSPseudos) => ({ ...styles, backgroundColor: 'white' }),
  multiValue: (styles: CSSPseudos, { data }: { data: PlaceOption }) => {
    const color = chroma(data.color);
    return {
      ...styles,
      backgroundColor: color.alpha(0.1).css(),
    };
  },
  multiValueLabel: (styles: CSSPseudos, { data }: { data: PlaceOption }) => ({
    ...styles,
    color: data.color,
  }),
  multiValueRemove: (styles: CSSPseudos, { data }: { data: PlaceOption }) => {
    return data.isFixed
      ? { ...styles, display: 'none' }
      : {
          ...styles,
          'color': data.color,
          ':hover': {
            backgroundColor: data.color,
            color: 'white',
            cursor: 'pointer',
          },
        };
  },
};

interface Props {
  country: Country;
  logScale?: boolean;
  variantInternationalSampleSet: SampleSetWithSelector;
  wholeInternationalSampleSet: SampleSetWithSelector;
}

const SelectWrapper = styled.div`
  margin: 0rem 1rem 1rem 0rem;
`

const VariantInternationalComparisonPlot = ({
  country,
  logScale,
  variantInternationalSampleSet,
  wholeInternationalSampleSet,
}: Props) => {
  const [selectedPlaceOptions, setSelectedPlaceOptions] = useState<any>([
    {
      value: country,
      label: country,
      color: country === 'Switzerland' ? chroma('red').hex() : chroma('blue').hex(),
      isFixed: true,
    },
  ]);

  const variantSamplesByCountry = useMemo(() => variantInternationalSampleSet.groupByField('country'), [
    variantInternationalSampleSet,
  ]);

  const placeOptions: PlaceOption[] = Array.from(variantSamplesByCountry.keys()).map(countryName => ({
    value: countryName,
    label: countryName,
    color:
      countryName === 'Switzerland'
        ? chroma('red').hex()
        : countryName === country
        ? chroma('blue').hex()
        : chroma.random().darken().hex(),
    isFixed: countryName === country,
  }));
  console.log(placeOptions);

  const wholeSamplesByCountry = useMemo(() => wholeInternationalSampleSet.groupByField('country'), [
    wholeInternationalSampleSet,
  ]);

  const plotData = useMemo(() => {
    console.log('Variant samples by country', variantSamplesByCountry);
    console.log('Whole samples by country', wholeSamplesByCountry);
    interface ProportionCountry {
      countryName: string;
      data: {
        dateString: string;
        proportion: number;
      }[];
    }
    const proportionCountries: ProportionCountry[] = selectedPlaceOptions.map(
      ({ value: country }: PlaceOption) => {
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
        console.log('international filled data', filledData);
        return {
          countryName: country,
          data: filledData.map(entry => ({
            dateString: entry.key.firstDay.string,
            proportion: entry.value.proportion,
          })),
        };
      }
    );

    const dateMap: Map<string, any> = new Map();

    for (let { countryName, data } of proportionCountries) {
      for (let { dateString, proportion } of data) {
        if (!dateMap.has(dateString)) {
          dateMap.set(dateString, {
            dateString,
          });
        }
        dateMap.get(dateString)[countryName] = Math.max(proportion, 0);
      }
    }

    const result = [...dateMap.values()].sort((a, b) => Date.parse(a.dateString) - Date.parse(b.dateString));
    console.log('Plottable result is', result);
    return result;
  }, [selectedPlaceOptions, variantSamplesByCountry, wholeSamplesByCountry, logScale]);
 

  const onChange = (value: any, { action, removedValue }: any) => {
    console.log(value);
    switch (action) {
      case 'remove-value':
      case 'pop-value':
        if (removedValue.isFixed) {
          return;
        }
        break;
      case 'clear':
        value = selectedPlaceOptions.filter((c: PlaceOption) => c.isFixed);
        break;
    }
    (value.length < MAX_SELECT + 1) && setSelectedPlaceOptions(value);
  };


  return (
    <Wrapper>
      <SelectWrapper>
        <Select
          closeMenuOnSelect={false}
          placeholder='Select countries...'
          isMulti
          options={placeOptions}
          styles={colourStyles}
          onChange={onChange}
          // menuIsOpen={selectedPlaceOptions.length < MAX_SELECT}
          value={selectedPlaceOptions}
        />
      </SelectWrapper>
      <ChartAndMetricsWrapper>
        <ChartWrapper>
          <ResponsiveContainer>
            <ComposedChart data={plotData} margin={{ top: 6, right: CHART_MARGIN_RIGHT, left: 0, bottom: 0 }}>
              <XAxis dataKey='dateString' />
              <YAxis />
              <Tooltip
                formatter={(value: number, name: string, props: unknown) => (value * 100).toFixed(2) + '%'}
                labelFormatter={label => {
                  return 'Date: ' + label;
                }}
              />
              {selectedPlaceOptions.map((place: PlaceOption) => (
                <Line
                  type='monotone'
                  dataKey={place.value}
                  strokeWidth={3}
                  dot={false}
                  stroke={place.color}
                  isAnimationActive={false}
                  key={place.value}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </ChartWrapper>
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