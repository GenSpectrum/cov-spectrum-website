import React, { useEffect, useRef, useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { HeaderDateRangeSelect } from './HeaderDateRangeSelect';
import { useExploreUrl } from '../helpers/explore-url';
import dayjs from 'dayjs';
import { DateRangeSelector, dateStringRegex, FixedDateRangeSelector } from '../data/DateRangeSelector';
import { globalDateCache } from '../helpers/date-cache';
import { useResizeDetector } from 'react-resize-detector';

interface Props {
  dateRangeSelector: DateRangeSelector;
}

const minimumDate: Date = new Date('2020-01-06'); // first day of first week of 2020
const today = new Date();

export const DateRangePicker = ({ dateRangeSelector }: Props) => {
  const { width, ref } = useResizeDetector<HTMLDivElement>();

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

  // useEffect(() => {
  //   changeDate();
  // }, [dateRange]);

  return (
    <>
      <div ref={ref} className='w-full flex flex-row items-center flex-wrap'>
        <HeaderDateRangeSelect exploreUrl={exploreUrl} />

        <div className={`flex flex-row ${width && width < 600 && 'flex-wrap'}`}>
          <span className='ml-1'>From:</span>{' '}
          <DatePicker
            className={`border rounded py-1.5 px-1.5 focus:outline-none focus:ring focus:border-blue-200 mr-2 ${
              width && width > 600 && 'ml-1'
            }`}
            onChangeRaw={(event: React.FocusEvent<HTMLInputElement>) => {
              if (event && event.target && event.target.value && event.target.value.match(dateStringRegex)) {
                const date = globalDateCache.getDay(event.target.value).dayjs.toDate();
                setDateRange([date, endDate]);
              }
            }}
            onKeyDown={changeDate}
            onBlur={changeDate}
            onClickOutside={changeDate}
            minDate={minimumDate}
            calendarStartDay={1}
            useWeekdaysShort={true}
            disabledKeyboardNavigation={true}
            selected={startDate}
            onChange={(date: Date) => {
              setDateRange([date, endDate]);
            }}
            onSelect={(date: Date) => {
              setDateRange([date, endDate]);
            }}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            dateFormat='yyyy-MM-dd'
          />
          <span>to:</span>
          <DatePicker
            className={`border rounded py-1.5 px-1.5 focus:outline-none focus:ring focus:border-blue-200 mr-2 ${
              width && width > 600 && 'ml-1'
            }`}
            onChangeRaw={(event: React.FocusEvent<HTMLInputElement>) => {
              if (event && event.target && event.target.value && event.target.value.match(dateStringRegex)) {
                if (
                  dateStringRegex.test(event.target.value) &&
                  event.target.value.split('-')[0].length === 4
                ) {
                  const date = globalDateCache.getDay(event.target.value).dayjs.toDate();
                  setDateRange([startDate, date]);
                }
              }
            }}
            onKeyDown={() => {
              changeDate();
            }}
            onBlur={changeDate}
            onClickOutside={changeDate}
            minDate={minimumDate}
            calendarStartDay={1}
            useWeekdaysShort={true}
            disabledKeyboardNavigation={true}
            selected={endDate}
            onChange={(date: Date) => {
              setDateRange([startDate, date]);
            }}
            onSelect={(date: Date) => {
              setDateRange([startDate, date]);
            }}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            dateFormat='yyyy-MM-dd'
          />
        </div>
      </div>
    </>
  );
};
