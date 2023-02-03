import React, { useEffect, useMemo, useState } from 'react';
import { ChartAndMetricsWrapper, Wrapper } from './common';
import { CountryDateCountSampleDataset } from '../data/sample/CountryDateCountSampleDataset';
import { Utils } from '../services/Utils';
import { CountryDateCountSampleEntry } from '../data/sample/CountryDateCountSampleEntry';
import RegionMap from '../maps/RegionMap';
import { UnifiedDay } from '../helpers/date-cache';
import { FaPause, FaPlay } from 'react-icons/fa';
import useInterval from '../helpers/interval';
import { Slider } from '@mui/material';
import { styled } from '@mui/material/styles';

const TOTAL_ANIMATION_DURATION = 10 * 1000;

export type VariantInternationalComparisonMapProps = {
  variantInternationalSampleSet: CountryDateCountSampleDataset;
  wholeInternationalSampleSet?: CountryDateCountSampleDataset;
  withTimeline?: boolean;
};

const MARK_CLASSES = 'hover:z-10 h-4 mt-0.5 pb-2';

export const VariantInternationalComparisonMap = ({
  variantInternationalSampleSet,
}: VariantInternationalComparisonMapProps) => {
  const [selectedRange, setSelectedRange] = useState([0, 0]);
  const [animationInterval, setAnimationInterval] = useState<number | null>(null);

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

  const handleRangeChange = (_: Event, value: number | number[]) => {
    setSelectedRange(value as number[]);
    setAnimationInterval(null);
  };

  useInterval(() => {
    setSelectedRange([0, (selectedRange[1] + 1) % availableDates.length]);
  }, animationInterval);

  return (
    <Wrapper>
      <ChartAndMetricsWrapper>
        <div style={{ height: 'auto' }} className='w-full'>
          <RegionMap data={mapData} selector={variantInternationalSampleSet.selector} />
        </div>
      </ChartAndMetricsWrapper>
      <div
        id='slider-wrapper'
        className='pt-5 px-12 md:pt-8 md:px-16 transform -translate-y-2 flex flex-row items-center'
      >
        <button
          className='mr-6 fill-current transform '
          onClick={e => {
            e.preventDefault();
            if (animationInterval !== null) {
              setAnimationInterval(null);
            } else {
              setAnimationInterval(Math.round(Math.round(TOTAL_ANIMATION_DURATION / availableDates.length)));
            }
          }}
        >
          {animationInterval === null ? <FaPlay /> : <FaPause />}
        </button>
        <ColoredSlider
          min={0}
          max={availableDates.length - 1}
          valueLabelDisplay='on'
          valueLabelFormat={value => <p className={MARK_CLASSES}>{availableDates[value]?.string}</p>}
          value={selectedRange}
          onChange={handleRangeChange}
        />
      </div>
    </Wrapper>
  );
};

const ColoredSlider = styled(Slider)({
  'color': 'red',
  '& .MuiSlider-valueLabel': {
    backgroundColor: 'transparent',
  },
  '& .MuiSlider-thumb': {
    '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
      boxShadow: 'inherit',
    },
  },
});
