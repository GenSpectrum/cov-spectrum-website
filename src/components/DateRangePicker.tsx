import React, { useEffect, useRef, useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { HeaderDateRangeSelect } from './HeaderDateRangeSelect';
import { useExploreUrl } from '../helpers/explore-url';
import dayjs from 'dayjs';
import {
  DateRangeSelector,
  dateRangeStringRegex,
  dateStringRegex,
  FixedDateRangeSelector,
} from '../data/DateRangeSelector';
import { globalDateCache } from '../helpers/date-cache';

interface Props {
  dateRangeSelector: DateRangeSelector;
}

const minimumDate: Date = new Date('2020-01-06'); // first day of first week of 2020
const today = new Date();

export const DateRangePicker = ({ dateRangeSelector }: Props) => {
  const { dateFrom, dateTo } = dateRangeSelector.getDateRange();
  const initialStartDate = dateFrom ? dateFrom.dayjs.toDate() : minimumDate;
  const initialEndDate = dateTo ? dateTo.dayjs.toDate() : today;
  const prevDateFrom = globalDateCache.getDayUsingDayjs(dayjs(initialStartDate));
  const prevDateTo = globalDateCache.getDayUsingDayjs(dayjs(initialEndDate));

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([initialStartDate, initialEndDate]);
  const [startDate, endDate] = dateRange;
  const datePickerRef = useRef<ReactDatePicker>(null);
  const exploreUrl = useExploreUrl();

  useEffect(() => {
    const startDate = dateFrom ? dateFrom.dayjs.toDate() : minimumDate;
    const endDate = dateTo ? dateTo.dayjs.toDate() : today;
    setDateRange([startDate, endDate]);
  }, [dateFrom, dateTo]);

  const changeDate = () => {
    if (startDate && endDate && startDate <= endDate) {
      const newDateFrom = globalDateCache.getDayUsingDayjs(dayjs(startDate));
      const newDateTo = globalDateCache.getDayUsingDayjs(dayjs(endDate));

      if (prevDateFrom.string !== newDateFrom.string || prevDateTo.string !== newDateTo.string) {
        exploreUrl?.setDateRange(
          new FixedDateRangeSelector({
            dateFrom: newDateFrom,
            dateTo: newDateTo,
          })
        );
        if (datePickerRef.current?.isCalendarOpen()) {
          datePickerRef.current?.setOpen(false);
        }
      }
    }
  };

  const handleDateRangeChangeRaw = (event: React.FocusEvent<HTMLInputElement>) => {
    if (
      event &&
      event.target &&
      event.target.value &&
      (dateStringRegex.test(event.target.value) || dateRangeStringRegex.test(event.target.value))
    ) {
      const range = event.target.value.split(' - ');
      const start = range?.length > 0 ? globalDateCache.getDay(range[0]).dayjs.toDate() : null;
      const end = range?.length > 1 ? globalDateCache.getDay(range[1]).dayjs.toDate() : null;
      setDateRange([start, end]);
    }
  };

  const handleDateRangeChange = (update: [Date, Date]) => {
    setDateRange(update);
  };

  return (
    <>
      <div className='w-full flex flex-row items-center'>
        <HeaderDateRangeSelect exploreUrl={exploreUrl} />
        <ReactDatePicker
          ref={datePickerRef}
          className='border rounded py-1.5 px-1.5 focus:outline-none focus:ring focus:border-blue-200 rounded-l-none border-left-0'
          dateFormat='yyyy-MM-dd'
          selectsRange={true}
          startDate={startDate}
          endDate={endDate}
          minDate={minimumDate}
          onChangeRaw={handleDateRangeChangeRaw}
          onChange={handleDateRangeChange}
          calendarStartDay={1}
          useWeekdaysShort={true}
          disabledKeyboardNavigation={true}
          onBlur={changeDate}
          onKeyDown={changeDate}
          shouldCloseOnSelect={false}
          onClickOutside={changeDate}
        />
      </div>
    </>
  );
};
