import React, { useMemo, useEffect } from 'react';
import chroma from 'chroma-js';
import { ChartAndMetricsWrapper, Wrapper } from './common';
import { CountryDateCountSampleDataset } from '../data/sample/CountryDateCountSampleDataset';
import { Utils } from '../services/Utils';
import { CountryDateCountSampleEntry } from '../data/sample/CountryDateCountSampleEntry';
import RegionMap from '../maps/RegionMap';

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
    .map(entry => entry.country);
};

const getPlaceColor = (place: string): string => {
  return place === 'Switzerland' ? chroma('red').hex() : chroma.random().darken().hex();
};

export type VariantInternationalComparisonMapProps = {
  variantInternationalSampleSet: CountryDateCountSampleDataset;
  wholeInternationalSampleSet?: CountryDateCountSampleDataset;
};

export const VariantInternationalComparisonMap = ({
  variantInternationalSampleSet,
}: VariantInternationalComparisonMapProps) => {
  const variantSamplesByCountry: Map<string, CountryDateCountSampleEntry[]> = useMemo(() => {
    const map = Utils.groupBy(variantInternationalSampleSet.payload, e => e.country);
    map.delete(null);
    return map as Map<string, CountryDateCountSampleEntry[]>;
  }, [variantInternationalSampleSet]);

  const mapData = useMemo(() => {
    return Array.from(variantSamplesByCountry).map(e => ({
      country: e[0],
      value: e[1].reduce((prev, curr) => prev + curr.count, 0),
    }));
  }, [variantSamplesByCountry]);

  useEffect(() => {
    console.log('map data is..', mapData);
  }, [mapData]);

  return (
    <Wrapper>
      <ChartAndMetricsWrapper>
        <div style={{ height: 400 }} className='w-full'>
          <RegionMap data={mapData} selector={variantInternationalSampleSet.selector} />
        </div>
      </ChartAndMetricsWrapper>
    </Wrapper>
  );
};
