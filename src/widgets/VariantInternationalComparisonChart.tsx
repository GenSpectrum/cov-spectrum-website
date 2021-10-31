import React, { useMemo, useState, useEffect } from 'react';
import { ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Select, { Styles } from 'react-select';
import chroma from 'chroma-js';
import styled, { CSSPseudos } from 'styled-components';
import { ChartAndMetricsWrapper, ChartWrapper, Wrapper } from './common';
import { CountryDateCountSampleDataset } from '../data/sample/CountryDateCountSampleDataset';
import { Utils } from '../services/Utils';
import { CountryDateCountSampleEntry } from '../data/sample/CountryDateCountSampleEntry';
import { fillFromWeeklyMap } from '../helpers/fill-missing';
import { UnifiedIsoWeek } from '../helpers/date-cache';

const CHART_MARGIN_RIGHT = 15;
const DEFAULT_SHOW = 5;

interface PlaceOption {
  value: string;
  label: string;
  color: string;
  isFixed: boolean;
}

interface ProportionCountry {
  countryName: string;
  data: {
    dateString: string;
    proportion: number;
  }[];
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

export type VariantInternationalComparisonChartProps = {
  preSelectedCountries: string[];
  logScale?: boolean;
  variantInternationalSampleSet: CountryDateCountSampleDataset;
  wholeInternationalSampleSet: CountryDateCountSampleDataset;
};

const SelectWrapper = styled.div`
  margin: 0rem 0rem 0.5rem 0rem;
`;

interface CountryCount {
  country: string;
  count: number;
}

const getCountriesMostVariantSamples = (
  variantSamplesByPlace: Map<string, CountryDateCountSampleEntry[]>,
  exclude: string[],
  n = DEFAULT_SHOW
): string[] => {
  const excludeSet = new Set(exclude);
  return Array.from(variantSamplesByPlace)
    .map(
      (entry): CountryCount => ({
        country: entry[0],
        count: entry[1].reduce((prev, curr) => prev + curr.count, 0),
      })
    )
    .filter(a => !excludeSet.has(a.country))
    .sort((a, b) => b.count - a.count)
    .slice(0, n)
    .map(entry => entry.country);
};

const getPlaceColor = (place: string): string => {
  return place === 'Switzerland' ? chroma('red').hex() : chroma.random().darken().hex();
};

export const VariantInternationalComparisonChart = ({
  preSelectedCountries,
  logScale,
  variantInternationalSampleSet,
  wholeInternationalSampleSet,
}: VariantInternationalComparisonChartProps) => {
  const [selectedPlaceOptions, setSelectedPlaceOptions] = useState<any>(
    preSelectedCountries.map(c => ({
      value: c,
      label: c,
      color: c === 'Switzerland' ? chroma('red').hex() : chroma('blue').hex(),
      isFixed: false,
    }))
  );

  const variantSamplesByCountry: Map<string, CountryDateCountSampleEntry[]> = useMemo(() => {
    const map = Utils.groupBy(variantInternationalSampleSet.getPayload(), e => e.country);
    map.delete(null);
    return map as Map<string, CountryDateCountSampleEntry[]>;
  }, [variantInternationalSampleSet]);

  useEffect(() => {
    const initialPlaces = [...preSelectedCountries].concat(
      getCountriesMostVariantSamples(
        variantSamplesByCountry,
        preSelectedCountries,
        Math.max(DEFAULT_SHOW - preSelectedCountries.length, 0)
      )
    );
    const newOptions = initialPlaces.map((place: string) => ({
      value: place,
      label: place,
      color: getPlaceColor(place),
      isFixed: false,
    }));
    setSelectedPlaceOptions(newOptions);
  }, [preSelectedCountries, variantSamplesByCountry]);

  const placeOptions: PlaceOption[] = Array.from(variantSamplesByCountry.keys()).map(countryName => ({
    value: countryName,
    label: countryName,
    color: getPlaceColor(countryName),
    isFixed: false,
  }));

  const plotData = useMemo(() => {
    const wholeSamplesByCountry = Utils.groupBy(wholeInternationalSampleSet.getPayload(), e => e.country);
    const proportionCountries: ProportionCountry[] = [...variantSamplesByCountry.entries()].map(
      ([country, variantSamples]) => {
        const variantSamplesByWeek = Utils.groupBy(
          variantSamples.filter(e => e.date),
          e => e.date!.isoWeek
        );
        const wholeSamplesByWeek = fillFromWeeklyMap(
          Utils.groupBy(
            wholeSamplesByCountry.get(country)!.filter(e => e.date),
            e => e.date!.isoWeek
          ),
          []
        );
        const variantCountByWeekMap = new Map<UnifiedIsoWeek, number>();
        for (const [week, entries] of variantSamplesByWeek) {
          variantCountByWeekMap.set(
            week,
            entries.reduce((prev, curr) => prev + curr.count, 0)
          );
        }
        const _data = wholeSamplesByWeek.map(({ key: week, value: wholeEntries }) => {
          const total = wholeEntries.reduce((prev, curr) => prev + curr.count, 0);
          const variant = variantCountByWeekMap.get(week) ?? 0;
          return {
            dateString: week.firstDay.string,
            proportion: variant / total,
          };
        });
        return {
          countryName: country,
          data: _data,
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

    return [...dateMap.values()].sort((a, b) => Date.parse(a.dateString) - Date.parse(b.dateString));
  }, [logScale, variantSamplesByCountry, wholeInternationalSampleSet]);

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
    setSelectedPlaceOptions(value);
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
                tickFormatter={tick => `${tick * 100}%`}
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
