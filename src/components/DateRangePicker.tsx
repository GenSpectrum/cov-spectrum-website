import TextField from '@mui/material/TextField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import React, { useEffect, useRef, useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { HeaderDateRangeSelect } from './HeaderDateRangeSelect';
import { useExploreUrl } from '../helpers/explore-url';
import dayjs from 'dayjs';
import { DateRangeSelector, FixedDateRangeSelector } from '../data/DateRangeSelector';
import { globalDateCache } from '../helpers/date-cache';
import { useResizeDetector } from 'react-resize-detector';

interface Props {
  dateRangeSelector: DateRangeSelector;
}

const minimumDate: Date = new Date('2020-01-06'); // first day of first week of 2020
const today = new Date();

export const DateRangePicker = ({ dateRangeSelector }: Props) => {
  const { width, ref } = useResizeDetector<HTMLDivElement>();

  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);

  const { dateFrom, dateTo } = dateRangeSelector.getDateRange();
  const initialStartDate = dateFrom ? dateFrom.dayjs.toDate() : minimumDate;
  const initialEndDate = dateTo ? dateTo.dayjs.toDate() : today;
  const prevDateFrom = globalDateCache.getDayUsingDayjs(dayjs(initialStartDate));
  const prevDateTo = globalDateCache.getDayUsingDayjs(dayjs(initialEndDate));

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([initialStartDate, initialEndDate]);

  //const [startDate, endDate] = dateRange;
  const datePickerRef = useRef<ReactDatePicker>(null);
  const exploreUrl = useExploreUrl();

  useEffect(() => {
    const startDate = dateFrom ? dateFrom.dayjs.toDate() : minimumDate;
    const endDate = dateTo ? dateTo.dayjs.toDate() : today;
    setStartDate(startDate);
    setEndDate(endDate);
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

  useEffect(() => {
    if (startDate && endDate) {
      changeDate();
    }
  }, [dateRange]);

  useEffect(() => {
    if (startDate && endDate) {
      setDateRange([startDate, endDate]);
    }
  }, [startDate, endDate]);

  const dateRegex = /[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/;

  return (
    <>
      <div ref={ref} className='w-full flex flex-row items-center flex-wrap'>
        <HeaderDateRangeSelect exploreUrl={exploreUrl} />

        <div className={`flex flex-row ${width && width < 600 && 'flex-wrap'}`}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label='from'
              value={startDate}
              onChange={value => {
                setStartDate(value);
              }}
              renderInput={params => (
                <TextField {...params} sx={{ marginLeft: '5px', height: '50px', width: '150px' }} />
              )}
            />
          </LocalizationProvider>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label='to'
              value={endDate}
              onChange={value => {
                setEndDate(value);
              }}
              renderInput={params => (
                <TextField
                  InputProps={{
                    readOnly: true,
                  }}
                  {...params}
                  sx={{ marginLeft: '5px', height: '50px', width: '150px' }}
                />
              )}
            />
          </LocalizationProvider>
        </div>
      </div>
    </>
  );
};
