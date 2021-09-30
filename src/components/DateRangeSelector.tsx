import React, { useEffect, useRef, useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { HeaderDateRangeSelect } from './HeaderDateRangeSelect';
import { DateRange, dateStringRegex } from '../services/api-types';
import { useExploreUrl } from '../helpers/explore-url';
import { dateRangeToDates } from '../services/api';
import dayjs from 'dayjs';
import { HiArrowNarrowRight } from 'react-icons/hi';
import ReactDatePicker from 'react-datepicker';

interface Props {
  dateRange: DateRange;
}

export const DateRangeSelector = ({ dateRange }: Props) => {
  const { dateFrom, dateTo } = dateRangeToDates(dateRange);
  const minimumDate: Date = new Date('2020-01-06'); // first day of first week of 2020
  const today = new Date();
  const [startDate, setStartDate] = useState<Date>(dateFrom ? dateFrom : minimumDate);
  const [endDate, setEndDate] = useState<Date>(dateTo ? dateTo : today);
  const exploreUrl = useExploreUrl();
  const startDatePickerRef = useRef<ReactDatePicker>(null);
  const endDatePickerRef = useRef<ReactDatePicker>(null);

  useEffect(() => {
    const { dateFrom, dateTo } = dateRangeToDates(dateRange);
    const startDate = dateFrom ? dateFrom : minimumDate;
    const endDate = dateTo ? dateTo : today;
    setStartDate(startDate);
    setEndDate(endDate);

    return () => {};
    // eslint-disable-next-line
  }, [dateRange]);

  const handleStartDateChange = (date: Date) => {
    const formattedDateRange = formatDateRangeForUrl(date, dateTo);
    if (formattedDateRange) exploreUrl?.setDateRange(formattedDateRange);
    setStartDate(date);
  };

  const handleEndDateChange = (date: Date) => {
    const formattedDateRange = formatDateRangeForUrl(dateFrom, date);
    if (formattedDateRange) exploreUrl?.setDateRange(formattedDateRange);
    setEndDate(date);
  };

  const formatDateRangeForUrl = (dateFrom?: Date, dateTo?: Date): DateRange | undefined => {
    // e.g:  from=2021-06-22&to=2021-09-22
    const from = dateFrom ? dateFrom : minimumDate;
    const to = dateTo ? dateTo : today;
    return `from=${dayjs(from).format('YYYY-MM-DD')}&to=${dayjs(to).format('YYYY-MM-DD')}` as DateRange;
  };

  const handleStartDateRaw = (event: React.FocusEvent<HTMLInputElement>) => {
    if (event && event.target && event.target.value && dateStringRegex.test(event.target.value)) {
      handleStartDateChange(new Date(event.target.value));
    }
  };

  const handleEndDateRaw = (event: React.FocusEvent<HTMLInputElement>) => {
    if (event && event.target && event.target.value && dateStringRegex.test(event.target.value)) {
      handleEndDateChange(new Date(event.target.value));
    }
  };

  const handleStartDateMonthChange = (date: Date) => {
    setStartDate(date);
  };

  const handleEndDateMonthChange = (date: Date) => {
    setEndDate(date);
  };

  const handleStartDateSelect = (date: Date, event: React.SyntheticEvent<any> | undefined) => {
    if (event) {
      handleStartDateChange(date);
    }
  };

  const handleEndDateSelect = (date: Date, event: React.SyntheticEvent<any> | undefined) => {
    if (event) {
      handleEndDateChange(date);
    }
  };

  return (
    <>
      <div className='flex flex-wrap space-x-1.5'>
        <div className='flex flex-row items-end inline-block align-middle'>
          <HeaderDateRangeSelect exploreUrl={exploreUrl} />
        </div>
        <div className='flex flex-nowrap space-x-1.5'>
          <div className='flex flex-row items-end inline-block align-middle'>
            <ReactDatePicker
              ref={startDatePickerRef}
              className='border rounded py-1.5 px-3 w-28 focus:outline-none focus:ring focus:border-blue-200'
              dateFormat='yyyy-MM-dd'
              selected={startDate}
              onChangeRaw={handleStartDateRaw}
              onChange={() => {}}
              onMonthChange={handleStartDateMonthChange}
              onSelect={handleStartDateSelect}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              minDate={minimumDate}
              maxDate={endDate}
              adjustDateOnChange
              enableTabLoop={false}
            />
          </div>
          <div className='flex flex-row items-center inline-block align-middle'>
            <HiArrowNarrowRight />
          </div>
          <div className='flex flex-row items-end inline-block align-middle'>
            <ReactDatePicker
              ref={endDatePickerRef}
              className='border rounded py-1.5 px-3 w-28 focus:outline-none focus:ring focus:border-blue-200'
              dateFormat='yyyy-MM-dd'
              selected={endDate}
              onChangeRaw={handleEndDateRaw}
              onChange={() => {}}
              onMonthChange={handleEndDateMonthChange}
              onSelect={handleEndDateSelect}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              adjustDateOnChange
              enableTabLoop={false}
            />
          </div>
        </div>
      </div>
    </>
  );
};
