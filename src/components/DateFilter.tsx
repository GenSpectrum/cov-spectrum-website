import React from 'react';
import 'react-modern-calendar-datepicker/lib/DatePicker.css';
import DatePicker, { DayRange, DayValue } from 'react-modern-calendar-datepicker';
import { Button } from 'react-bootstrap';
import { HeaderDateRangeSelect } from './HeaderDateRangeSelect';
import { dateRangeToDates, dateRangeToString } from '../services/api';
import { useExploreUrl } from '../helpers/explore-url';
import { DateRange } from '../services/api-types';

interface Props {
  dateRange: DateRange;
}

export const DateFilter = ({ dateRange }: Props) => {
  const { dateFrom, dateTo } = dateRangeToDates(dateRange);
  const [dayRange, setDayRange] = React.useState<DayRange>({
    from: dateFrom ? formatCustomDateRange(dateFrom) : null,
    to: dateTo ? formatCustomDateRange(dateTo) : null,
  });
  const exploreUrl = useExploreUrl();

  function formatCustomDateRange(date: Date) {
    // Date.getMonth starts from January = 0
    return { day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear() };
  }

  const formatDateRange = (dayRange: DayRange) => {
    const dateFrom = dayRange.from;
    const dateTo = dayRange.to;
    if (dateFrom && dateTo) {
      return `${dateFrom.day}/${dateFrom.month}/${dateFrom.year} - ${dateTo.day}/${dateTo.month}/${dateTo.year}`;
    }
  };

  const renderCustomInput = ({ ref }: any) => (
    <input
      ref={ref} // necessary
      placeholder={dateRange ? dateRangeToString(dateRange) : `Select Date Range`}
      value={dayRange && dayRange.from && dayRange.to ? `${formatDateRange(dayRange)}` : ''}
      className='custom-date-filter-input'
    />
  );

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
      return `from=${dateFrom.year}-${dateFrom.month}-${dateFrom.day}&to=${dateTo.year}-${dateTo.month}-${dateTo.day}` as DateRange;
    }
  };

  return (
    <div className='ml-2 mt-3 inline-block align-middle'>
      <div style={{ backgroundColor: 'green' }}></div>
      <DatePicker
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
