import React, { useEffect, useRef, useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { HeaderDateRangeSelect } from './HeaderDateRangeSelect';
import { useExploreUrl } from '../helpers/explore-url';
import dayjs from 'dayjs';
import { HiArrowNarrowRight } from 'react-icons/hi';
import ReactDatePicker from 'react-datepicker';
import { DateRangeSelector, dateStringRegex, FixedDateRangeSelector } from '../data/DateRangeSelector';
import { globalDateCache, UnifiedDay } from '../helpers/date-cache';

interface Props {
  dateRangeSelector: DateRangeSelector;
}

const minimumDate: Date = new Date('2020-01-06'); // first day of first week of 2020
const today = new Date();

export const DateRangePicker = ({ dateRangeSelector }: Props) => {
  const { dateFrom, dateTo } = dateRangeSelector.getDateRange();
  const [startDate, setStartDate] = useState<Date>(dateFrom ? dateFrom.dayjs.toDate() : minimumDate);
  const [endDate, setEndDate] = useState<Date>(dateTo ? dateTo.dayjs.toDate() : today);
  const starDateRef = useRef<ReactDatePicker>(null);
  const endDateRef = useRef<ReactDatePicker>(null);
  const exploreUrl = useExploreUrl();

  useEffect(() => {
    const startDate = dateFrom ? dateFrom.dayjs.toDate() : minimumDate;
    const endDate = dateTo ? dateTo.dayjs.toDate() : today;
    setStartDate(startDate);
    setEndDate(endDate);

    return () => {};
  }, [dateFrom, dateTo]);

  const changeDate = () => {
    const newDateFrom = globalDateCache.getDayUsingDayjs(dayjs(startDate));
    const newDateTo = globalDateCache.getDayUsingDayjs(dayjs(endDate));

    if (
      (dateFrom && dateFrom.string !== newDateFrom.string) ||
      (dateTo && dateTo.string !== newDateTo.string)
    ) {
      exploreUrl?.setDateRange(
        new FixedDateRangeSelector({
          dateFrom: newDateFrom,
          dateTo: newDateTo,
        })
      );
    }
  };

  const handleStartDateChange = (date: UnifiedDay) => {
    setStartDate(date.dayjs.toDate());
  };

  const handleEndDateChange = (date: UnifiedDay) => {
    setEndDate(date.dayjs.toDate());
  };

  const handleStartDateRaw = (event: React.FocusEvent<HTMLInputElement>) => {
    if (event && event.target && event.target.value && dateStringRegex.test(event.target.value)) {
      handleStartDateChange(globalDateCache.getDay(event.target.value));
    }
  };

  const handleEndDateRaw = (event: React.FocusEvent<HTMLInputElement>) => {
    if (event && event.target && event.target.value && dateStringRegex.test(event.target.value)) {
      handleEndDateChange(globalDateCache.getDay(event.target.value));
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
      handleStartDateChange(globalDateCache.getDayUsingDayjs(dayjs(date)));
      starDateRef.current?.setFocus();
    }
  };

  const handleEndDateSelect = (date: Date, event: React.SyntheticEvent<any> | undefined) => {
    if (event) {
      handleEndDateChange(globalDateCache.getDayUsingDayjs(dayjs(date)));
      endDateRef.current?.setFocus();
    }
  };

  return (
    <>
      <div className='flex flex-wrap '>
        <div className='flex flex-row items-end inline-block align-middle mr-1'>
          <HeaderDateRangeSelect exploreUrl={exploreUrl} />
        </div>
        <div className='flex flex-nowrap'>
          <div className='flex flex-row items-end inline-block align-middle mr-1'>
            <ReactDatePicker
              ref={starDateRef}
              enableTabLoop={false}
              disabledKeyboardNavigation={true}
              preventOpenOnFocus={true}
              className='border rounded py-1.5 pl-3 w-28 focus:outline-none focus:ring focus:border-blue-200'
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
              calendarStartDay={1}
              useWeekdaysShort={true}
              onBlur={changeDate}
              shouldCloseOnSelect={false}
            />
          </div>
          <div className='flex flex-row items-center inline-block align-middle mr-1'>
            <HiArrowNarrowRight />
          </div>
          <div className=' flex-row items-end inline-block align-middle mr-1'>
            <ReactDatePicker
              ref={endDateRef}
              enableTabLoop={false}
              disabledKeyboardNavigation={true}
              preventOpenOnFocus={true}
              className='border rounded py-1.5 pl-3 w-28 focus:outline-none focus:ring focus:border-blue-200'
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
              calendarStartDay={1}
              useWeekdaysShort={true}
              onBlur={changeDate}
              shouldCloseOnSelect={false}
            />
          </div>
        </div>
      </div>
    </>
  );
};
