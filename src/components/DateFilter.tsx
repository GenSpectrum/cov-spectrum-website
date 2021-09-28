import React, { RefObject, useEffect, useState } from 'react';
import 'react-modern-calendar-datepicker/lib/DatePicker.css';
import DatePicker, {
  CalendarDigit,
  Day,
  DayRange,
  DayValue,
  Locale,
  RenderInputProps,
} from 'react-modern-calendar-datepicker-fix';
import { Button } from 'react-bootstrap';
import { HeaderDateRangeSelect } from './HeaderDateRangeSelect';
import { dateRangeToDates, dateRangeToString } from '../services/api';
import { useExploreUrl } from '../helpers/explore-url';
import { ALL_TIMES, DateRange } from '../services/api-types';
import dayjs from 'dayjs';

interface Props {
  dateRange: DateRange;
}

export const DateFilter = ({ dateRange }: Props) => {
  const [dayRange, setDayRange] = useState<DayRange>({
    from: null,
    to: null,
  });
  const exploreUrl = useExploreUrl();
  const minimumDate: DayValue = { year: 2020, month: 1, day: 6 };

  useEffect(() => {
    const { dateFrom, dateTo } = dateRangeToDates(dateRange);
    const dayRange = {
      from: dateFrom ? formatCustomDateRange(dateFrom) : null,
      to: dateTo ? formatCustomDateRange(dateTo) : null,
    };
    setDayRange(dayRange);

    return () => {};
  }, [dateRange]);

  function formatCustomDateRange(date: Date) {
    // Date.getMonth starts from January = 0
    return { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear() };
  }

  const formatDateRange = (dayRange: DayRange) => {
    let dateFromString;
    let dateToString;

    if (dayRange.from) {
      const dateFrom = new Date(dayRange.from.year, dayRange.from.month - 1, dayRange.from.day);
      const monthFrom = dateFrom.toLocaleString('default', { month: 'short' });
      dateFromString = `${dayRange.from.day} ${monthFrom} ${dayRange.from.year}`;
    }

    if (dayRange.to) {
      const dateTo = new Date(dayRange.to.year, dayRange.to.month - 1, dayRange.to.day);
      const monthTo = dateTo.toLocaleString('default', { month: 'short' });
      dateToString = `${dayRange.to.day} ${monthTo} ${dayRange.to.year}`;
    }

    return dateFromString && dateToString
      ? `${dateFromString} - ${dateToString}`
      : dateFromString
      ? `${dateFromString} -`
      : '';
  };

  const renderCustomInput = ({ ref }: RenderInputProps) => {
    return (
      <input
        ref={ref as RefObject<HTMLInputElement>} // necessary
        placeholder={
          dateRange && dateRange === ALL_TIMES ? dateRangeToString(dateRange) : `Select Date Range`
        }
        value={dayRange && dayRange.from && dayRange.to ? `${formatDateRange(dayRange)}` : ''}
        className='custom-date-filter-input'
      />
    );
  };

  const resetDateFilter = () => {
    setDayRange({ from: null, to: null });
    exploreUrl?.setDateRange('AllTimes');
  };

  const handleChange = (dayRange: DayRange) => {
    const formattedDateRange = formatDateRangeForUrl(dayRange.from, dayRange.to);
    if (formattedDateRange) exploreUrl?.setDateRange(formattedDateRange);
    setDayRange(dayRange);
  };

  const formatDateRangeForUrl = (dateFrom: DayValue, dateTo: DayValue): DateRange | undefined => {
    if (dateFrom && dateTo) {
      // e.g:  dateFrom=2021-06-22&dateTo=2021-09-22
      const from = new Date(dateFrom.year, dateFrom.month - 1, dateFrom.day).toISOString();
      const to = new Date(dateTo.year, dateTo.month - 1, dateTo.day).toISOString();
      return `from=${dayjs(from).format('YYYY-MM-DD')}&to=${dayjs(to).format('YYYY-MM-DD')}` as DateRange;
    }
  };

  const myCustomLocale: Locale = {
    // months list by order
    months: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],

    // week days by order
    weekDays: [
      {
        name: 'Monday',
        short: 'M',
      },
      {
        name: 'Tuesday',
        short: 'T',
      },
      {
        name: 'Wednesday',
        short: 'W',
      },
      {
        name: 'Thursday',
        short: 'T',
      },
      {
        name: 'Friday',
        short: 'F',
      },
      {
        name: 'Saturday',
        short: 'S',
        isWeekend: true,
      },
      {
        name: 'Sunday', // used for accessibility
        short: 'S', // displayed at the top of days' rows
        isWeekend: true, // is it a formal weekend or not?
      },
    ],

    // just play around with this number between 0 and 6
    weekStartingIndex: 0,

    // return a { year: number, month: number, day: number } object
    getToday(gregorainTodayObject: Day) {
      return gregorainTodayObject;
    },

    // return a native JavaScript date here
    toNativeDate(date: Day) {
      return new Date(date.year, date.month - 1, date.day);
    },

    // return a number for date's month length
    getMonthLength(date: Day) {
      return new Date(date.year, date.month, 0).getDate();
    },

    // return a transformed digit to your locale
    transformDigit(digit: CalendarDigit) {
      return digit;
    },

    // texts in the date picker
    nextMonth: 'Next Month',
    previousMonth: 'Previous Month',
    openMonthSelector: 'Open Month Selector',
    openYearSelector: 'Open Year Selector',
    closeMonthSelector: 'Close Month Selector',
    closeYearSelector: 'Close Year Selector',
    defaultPlaceholder: 'Select...',

    // for input range value
    from: 'from',
    to: 'to',

    // used for input value when multi dates are selected
    digitSeparator: ',',

    // if your provide -2 for example, year will be 2 digited
    yearLetterSkip: 0,

    // is your language rtl or ltr?
    isRtl: false,
  };

  return (
    <div className='ml-2 mt-3 inline-block align-middle'>
      <DatePicker
        locale={myCustomLocale}
        minimumDate={minimumDate}
        value={dayRange}
        onChange={handleChange}
        renderInput={renderCustomInput}
        renderFooter={() => (
          <div className='flex justify-center space-x-1 pb-2'>
            <HeaderDateRangeSelect exploreUrl={exploreUrl} />
            <Button variant='secondary' size='sm' onClick={resetDateFilter}>
              Reset
            </Button>
          </div>
        )}
      />
    </div>
  );
};
