import React, { useEffect, useState } from 'react';
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
  const exploreUrl = useExploreUrl();

  useEffect(() => {
    const startDate = dateFrom ? dateFrom.dayjs.toDate() : minimumDate;
    const endDate = dateTo ? dateTo.dayjs.toDate() : today;
    setStartDate(startDate);
    setEndDate(endDate);

    return () => {};
  }, [dateFrom, dateTo]);

  const handleStartDateChange = (date: UnifiedDay) => {
    exploreUrl?.setDateRange(
      new FixedDateRangeSelector({ dateFrom: date, dateTo: dateTo ?? globalDateCache.today() })
    );
    setStartDate(date.dayjs.toDate());
  };

  const handleEndDateChange = (date: UnifiedDay) => {
    exploreUrl?.setDateRange(new FixedDateRangeSelector({ dateFrom, dateTo: date }));
    setStartDate(date.dayjs.toDate());
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
    }
  };

  const handleEndDateSelect = (date: Date, event: React.SyntheticEvent<any> | undefined) => {
    if (event) {
      handleEndDateChange(globalDateCache.getDayUsingDayjs(dayjs(date)));
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
              locale='de-ch'
              calendarStartDay={1}
              useWeekdaysShort={true}
            />
          </div>
          <div className='flex flex-row items-center inline-block align-middle mr-1'>
            <HiArrowNarrowRight />
          </div>
          <div className=' flex-row items-end inline-block align-middle mr-1'>
            <ReactDatePicker
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
              locale='de-ch'
              calendarStartDay={1}
              useWeekdaysShort={true}
            />
          </div>
        </div>
      </div>
    </>
  );
};
