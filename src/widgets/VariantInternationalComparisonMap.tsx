import React, { useEffect, useMemo, useState } from 'react';
import { ChartAndMetricsWrapper, Wrapper } from './common';
import { CountryDateCountSampleDataset } from '../data/sample/CountryDateCountSampleDataset';
import { Utils } from '../services/Utils';
import { CountryDateCountSampleEntry } from '../data/sample/CountryDateCountSampleEntry';
import RegionMap from '../maps/RegionMap';
import Range from 'rc-slider/lib/Range';
import 'rc-slider/assets/index.css';
import { UnifiedDay } from '../helpers/date-cache';

enum DataMode {
  CUMULATIVE_TOTAL,
  PROPORTION_OF_TOTAL_IN_TIMEFRAME,
}

export type VariantInternationalComparisonMapProps = {
  variantInternationalSampleSet: CountryDateCountSampleDataset;
  wholeInternationalSampleSet?: CountryDateCountSampleDataset;
  withTimeline: boolean;
};

const getMarks = (avilableDates: UnifiedDay[], selectedRange: number[]) => {
  const marks = {
    [selectedRange[0]]: avilableDates[selectedRange[0]].string,
    [selectedRange[1]]: avilableDates[selectedRange[1]].string,
  };
  console.log(marks);
  return marks;
};

export const VariantInternationalComparisonMap = ({
  variantInternationalSampleSet,
  withTimeline = false,
}: VariantInternationalComparisonMapProps) => {
  const [endDate, setEndDate] = useState();
  const [selectedRange, setSelectedRange] = useState([0, 0]);

  const variantSamplesByCountry: Map<string, CountryDateCountSampleEntry[]> = useMemo(() => {
    const map = Utils.groupBy(variantInternationalSampleSet.payload, e => e.country);
    map.delete(null);
    return map as Map<string, CountryDateCountSampleEntry[]>;
  }, [variantInternationalSampleSet]);

  const availableDates = useMemo(
    () => Array.from(Utils.groupBy(variantInternationalSampleSet.payload, e => e.date).keys()),
    [variantInternationalSampleSet]
  );

  useEffect(() => {
    setSelectedRange([0, availableDates.length - 1]);
  }, [availableDates]);

  const selectedDates = availableDates.slice(selectedRange[0], selectedRange[1]);

  const mapData = useMemo(() => {
    return Array.from(variantSamplesByCountry)
      .map(e => ({
        country: e[0],
        value: e[1].reduce((prev, curr) => {
          if (selectedDates.includes(curr.date)) return prev + curr.count;
          return prev;
        }, 0),
      }))
      .filter(e => e.value > 0);
  }, [variantSamplesByCountry, selectedDates]);

  useEffect(() => {
    console.log('keys are', availableDates);
  }, [availableDates]);

  const handleRangeChange = (value: number[]) => {
    setSelectedRange(value);
  };

  return (
    <Wrapper>
      <ChartAndMetricsWrapper>
        <div style={{ height: 'auto' }} className='w-full'>
          <RegionMap data={mapData} selector={variantInternationalSampleSet.selector} />
        </div>
      </ChartAndMetricsWrapper>
      <div id='slider-wrapper' className=''>
        <Range
          min={0}
          max={availableDates.length - 1}
          marks={getMarks(availableDates as UnifiedDay[], selectedRange)}
          value={selectedRange}
          onChange={handleRangeChange}
        />
      </div>
    </Wrapper>
  );
};
