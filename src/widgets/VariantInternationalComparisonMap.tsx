import React, { useMemo } from 'react';
import { ChartAndMetricsWrapper, Wrapper } from './common';
import { CountryDateCountSampleDataset } from '../data/sample/CountryDateCountSampleDataset';
import { Utils } from '../services/Utils';
import { CountryDateCountSampleEntry } from '../data/sample/CountryDateCountSampleEntry';
import RegionMap from '../maps/RegionMap';

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

  return (
    <Wrapper>
      <ChartAndMetricsWrapper>
        <div style={{ height: 'auto' }} className='w-full'>
          <RegionMap data={mapData} selector={variantInternationalSampleSet.selector} />
        </div>
      </ChartAndMetricsWrapper>
    </Wrapper>
  );
};
