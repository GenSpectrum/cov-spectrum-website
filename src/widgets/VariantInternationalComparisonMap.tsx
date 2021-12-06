import React, { useEffect, useMemo, useState } from 'react';
import { ChartAndMetricsWrapper, Wrapper } from './common';
import { CountryDateCountSampleDataset } from '../data/sample/CountryDateCountSampleDataset';
import { Utils } from '../services/Utils';
import { CountryDateCountSampleEntry } from '../data/sample/CountryDateCountSampleEntry';
import RegionMap from '../maps/RegionMap';
import Range from 'rc-slider/lib/Range';
import 'rc-slider/assets/index.css';
import { UnifiedDay } from '../helpers/date-cache';

export type VariantInternationalComparisonMapProps = {
  variantInternationalSampleSet: CountryDateCountSampleDataset;
  wholeInternationalSampleSet?: CountryDateCountSampleDataset;
  withTimeline?: boolean;
};

const getMarks = (avilableDates: UnifiedDay[], selectedRange: number[]) => {
  const MARK_CLASSES = 'w-20 md:w-32 bg-white hover:z-10 h-4 mt-0.5 pb-2';

  const marks = {
    [selectedRange[0]]:
      selectedRange[1] - selectedRange[0] > 2 ? (
        <p className={MARK_CLASSES}>{avilableDates[selectedRange[0]].string}</p>
      ) : (
        ''
      ),
    [selectedRange[1]]: <p className={MARK_CLASSES}>{avilableDates[selectedRange[1]].string}</p>,
  };
  return marks;
};

export const VariantInternationalComparisonMap = ({
  variantInternationalSampleSet,
}: VariantInternationalComparisonMapProps) => {
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
      <div id='slider-wrapper' className='pb-5 px-12 md:pb-8 md:px-16 transform -translate-y-2'>
        <Range
          min={0}
          max={availableDates.length - 1}
          marks={getMarks(availableDates as UnifiedDay[], selectedRange)}
          value={selectedRange}
          onChange={handleRangeChange}
          trackStyle={[{ backgroundColor: 'red' }]}
          handleStyle={[
            { backgroundColor: 'red', border: 'red' },
            { backgroundColor: 'red', border: 'red', boxShadow: 'black' },
          ]}
        />
      </div>
    </Wrapper>
  );
};
