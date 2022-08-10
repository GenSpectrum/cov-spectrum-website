import { useExploreUrl } from '../helpers/explore-url';
import { makeLayout } from '../helpers/deep-page';
import { VariantHeader } from '../components/VariantHeader';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import React, { useMemo } from 'react';
import { Chen2021FitnessWidget } from '../models/chen2021Fitness/Chen2021FitnessWidget';
import { useQuery } from '../helpers/query-hook';
import { DateCountSampleData } from '../data/sample/DateCountSampleDataset';
import { useSingleSelectorsFromExploreUrl } from '../helpers/selectors-from-explore-url-hook';
import Loader from '../components/Loader';
import { globalDateCache } from '../helpers/date-cache';
import dayjs from 'dayjs';
import { fetchCaseCounts } from '../data/api';
import { FixedDateRangeSelector } from '../data/DateRangeSelector';
import { isInDateRange } from '../data/DateRange';

export const DeepChen2021FitnessPage = () => {
  const exploreUrl = useExploreUrl();

  const { ldvsSelector, lvsSelector, lsSelector, lSelector } = useSingleSelectorsFromExploreUrl(exploreUrl!);
  const variantDateCount = useQuery(signal => DateCountSampleData.fromApi(lvsSelector, signal), [
    lvsSelector,
  ]);
  const wholeDateCount = useQuery(signal => DateCountSampleData.fromApi(lsSelector, signal), [lsSelector]);

  // Start date: day of first variant case
  const startDate = useMemo(() => {
    if (!variantDateCount.data || !wholeDateCount.data) {
      return undefined;
    }
    // Start date: day of first variant case in the past six months
    let startDate = globalDateCache.getDayUsingDayjs(dayjs());
    for (let { date } of variantDateCount.data.payload) {
      if (date && date.dayjs.isBefore(startDate.dayjs) && date.dayjs.isAfter(dayjs().subtract(6, 'month'))) {
        startDate = date;
      }
    }
    return startDate;
  }, [variantDateCount.data, wholeDateCount.data]);
  // startDateRange = startDate +/-3 days
  const startDateRange = useMemo(
    () =>
      startDate &&
      new FixedDateRangeSelector({
        dateFrom: globalDateCache.getDayUsingDayjs(startDate.dayjs.subtract(3, 'day')),
        dateTo: globalDateCache.getDayUsingDayjs(startDate.dayjs.add(3, 'day')),
      }),
    [startDate]
  );

  const casesInStartDateRange = useQuery(
    signal =>
      !startDateRange
        ? Promise.resolve(undefined)
        : fetchCaseCounts(
            {
              ...lSelector,
              dateRange: startDateRange,
            },
            signal,
            []
          ),
    [lSelector, startDateRange]
  );

  // Determine default values based on data
  const defaults = useMemo(() => {
    if (
      !variantDateCount.data ||
      !wholeDateCount.data ||
      !startDate ||
      !startDateRange ||
      !casesInStartDateRange.data
    ) {
      return undefined;
    }
    // Sequenced samples in startDateRange
    let variantCountInStartDateRange = 0;
    for (let { date, count } of variantDateCount.data.payload) {
      if (date && isInDateRange(startDateRange.getDateRange(), date)) {
        variantCountInStartDateRange += count;
      }
    }
    let wholeCountInStartDateRange = 0;
    for (let { date, count } of wholeDateCount.data.payload) {
      if (date && isInDateRange(startDateRange.getDateRange(), date)) {
        wholeCountInStartDateRange += count;
      }
    }
    // Initial variant cases: cases \times frequency of variant in the startDateRange
    const numberTotalCases = Math.round(casesInStartDateRange.data[0].newCases / 7);
    const initialVariantCases = Math.round(
      (variantCountInStartDateRange / wholeCountInStartDateRange) * numberTotalCases
    );
    const initialWildtypeCases = numberTotalCases - initialVariantCases;
    // Initial wildtype cases: 7day average of cases at time of start date (average calculated as average of cases in
    // the 3 days before/after the day of interest)
    return {
      startDate,
      initialWildtypeCases,
      initialVariantCases,
    };
  }, [variantDateCount.data, wholeDateCount.data, startDate, startDateRange, casesInStartDateRange.data]);

  if (!exploreUrl) {
    return null;
  }

  return makeLayout(
    <VariantHeader
      dateRange={exploreUrl.dateRange}
      variant={exploreUrl.variants![0]}
      controls={
        <Button className='mt-2' variant='secondary' as={Link} to={exploreUrl.getOverviewPageUrl()}>
          Back to overview
        </Button>
      }
      titleSuffix='Relative growth advantage'
    />,
    defaults ? (
      <Chen2021FitnessWidget.ShareableComponent
        title='Relative growth advantage'
        selector={ldvsSelector}
        defaults={defaults}
      />
    ) : (
      <Loader />
    )
  );
};
