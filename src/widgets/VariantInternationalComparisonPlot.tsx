import React, { useMemo, useState, useEffect } from 'react';
import { omit } from 'lodash';
import * as zod from 'zod';
import { fillFromWeeklyMap } from '../helpers/fill-missing';
import { AsyncZodQueryEncoder } from '../helpers/query-encoder';
import { NewSampleSelectorSchema } from '../helpers/sample-selector';
import { ParsedMultiSample, SampleSet, SampleSetWithSelector } from '../helpers/sample-set';
import { getNewSamples, isRegion } from '../services/api';
import { Country, CountrySchema, Place } from '../services/api-types';
import { Widget } from './Widget';
import { ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Select, { Styles } from 'react-select';
import chroma from 'chroma-js';
import styled, { CSSPseudos } from 'styled-components';
import { ChartAndMetricsWrapper, ChartWrapper, Wrapper } from '../charts/common';

const CHART_MARGIN_RIGHT = 15;
const MAX_SELECT = 6;
const DEFAULT_SHOW = 4;

interface PlaceOption {
  value: string;
  label: string;
  color: string;
  isFixed: boolean;
}

const colorStyles: Partial<Styles<any, true, any>> = {
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
  margin: 0rem 0rem 0.5rem 0rem;
`;

interface PlaceCount {
  place: Place;
  count: number;
}

const getPlacesMostVariantSamples = (
  variantSamplesByPlace: Map<Place, any>,
  exclude: Place,
  n = DEFAULT_SHOW
): string[] => {
  const result = Array.from(variantSamplesByPlace)
    .map(
      (entry: [Place, ParsedMultiSample[]]): PlaceCount => ({
        place: entry[0],
        count: entry[1].reduce((total: number, entry: ParsedMultiSample) => total + entry.count, 0),
      })
    )
    .filter((a: PlaceCount) => a.place !== exclude)
    .sort((a: PlaceCount, b: PlaceCount) => b.count - a.count)
    .slice(0, n - 1)
    .map((entry: PlaceCount) => entry.place);
  return result;
};

const getPlaceColor = (place: Place, selectedPlace: Place): string => {
  return place === 'Switzerland'
    ? chroma('red').hex()
    : place === selectedPlace
    ? chroma('blue').hex()
    : chroma.random().darken().hex();
};

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
  getPlacesMostVariantSamples(variantSamplesByCountry, country);

  useEffect(() => {
    const initialPlaces = isRegion(country)
      ? getPlacesMostVariantSamples(variantSamplesByCountry, country, DEFAULT_SHOW + 1)
      : [country].concat(getPlacesMostVariantSamples(variantSamplesByCountry, country, DEFAULT_SHOW));
    const newOptions = initialPlaces.map((place: Place) => ({
      value: place,
      label: place,
      color: getPlaceColor(place, country),
      isFixed: place === country,
    }));
    setSelectedPlaceOptions(newOptions);
  }, [country, variantSamplesByCountry]);

  const placeOptions: PlaceOption[] = Array.from(variantSamplesByCountry.keys()).map(countryName => ({
    value: countryName,
    label: countryName,
    color: getPlaceColor(countryName, country),
    isFixed: countryName === country,
  }));

  const wholeSamplesByCountry = useMemo(() => wholeInternationalSampleSet.groupByField('country'), [
    wholeInternationalSampleSet,
  ]);

  const plotData = useMemo(() => {
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
        }).map(({ value: { proportion, ...restValue }, key }) => ({
          key,
          value: { ...restValue, proportion: proportion! },
        }));
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
        if (logScale && proportion <= 0) {
          continue;
        }
        dateMap.get(dateString)[countryName] = Math.max(proportion, 0);
      }
    }

    const result = [...dateMap.values()].sort((a, b) => Date.parse(a.dateString) - Date.parse(b.dateString));
    return result;
  }, [logScale, selectedPlaceOptions, variantSamplesByCountry, wholeSamplesByCountry]);

  const onChange = (value: any, { action, removedValue }: any) => {
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
    value.length < MAX_SELECT + 1 && setSelectedPlaceOptions(value);
  };

  return (
    <Wrapper>
      <SelectWrapper>
        <Select
          closeMenuOnSelect={false}
          placeholder='Select countries...'
          isMulti
          options={placeOptions}
          styles={colorStyles}
          onChange={onChange}
          value={selectedPlaceOptions}
        />
      </SelectWrapper>
      <ChartAndMetricsWrapper>
        <ChartWrapper>
          <ResponsiveContainer>
            <ComposedChart data={plotData} margin={{ top: 6, right: CHART_MARGIN_RIGHT, left: 0, bottom: 0 }}>
              <XAxis dataKey='dateString' xAxisId='date' />
              <YAxis
                yAxisId='variant-proportion'
                scale={logScale ? 'log' : 'auto'}
                domain={logScale ? ['auto', 'auto'] : [0, 'auto']}
              />
              <Tooltip
                formatter={(value: number) => (value * 100).toFixed(2) + '%'}
                labelFormatter={label => {
                  return 'Date: ' + label;
                }}
              />
              {selectedPlaceOptions.map((place: PlaceOption) => (
                <Line
                  yAxisId='variant-proportion'
                  xAxisId='date'
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
