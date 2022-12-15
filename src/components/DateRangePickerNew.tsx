import * as React from 'react';
import TextField from '@mui/material/TextField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useResizeDetector } from 'react-resize-detector';
import { DateRangeSelector, FixedDateRangeSelector } from '../data/DateRangeSelector';
import { useEffect, useState } from 'react';
import { globalDateCache } from '../helpers/date-cache';
import dayjs from 'dayjs';

const minimumDate: Date = new Date('2020-01-06'); // first day of first week of 2020
const today = new Date();

interface Props {
  dateRangeSelector: DateRangeSelector;
  setDateRangeSelector?: React.Dispatch<React.SetStateAction<DateRangeSelector>>;
}

export default function BasicDatePicker({ dateRangeSelector, setDateRangeSelector }: Props) {
  const { width, ref } = useResizeDetector<HTMLDivElement>();

  const { dateFrom, dateTo } = dateRangeSelector.getDateRange();
  // const initialStartDate = dateFrom ? dateFrom.dayjs.toDate() : minimumDate;
  // const initialEndDate = dateTo ? dateTo.dayjs.toDate() : today;
  // const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([initialStartDate, initialEndDate]);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    const startDate = dateFrom ? dateFrom.dayjs.toDate() : minimumDate;
    const endDate = dateTo ? dateTo.dayjs.toDate() : today;
    setStartDate(startDate);
    setEndDate(endDate);
    // setDateRange([startDate, endDate]);
  }, [dateFrom, dateTo]);

  useEffect(() => {
    console.log(startDate);
    console.log(endDate);
    if (startDate && endDate && startDate <= endDate) {
      const newDateFrom = globalDateCache.getDayUsingDayjs(dayjs(startDate));
      const newDateTo = globalDateCache.getDayUsingDayjs(dayjs(endDate));

      if (setDateRangeSelector) {
        setDateRangeSelector(
          new FixedDateRangeSelector({
            dateFrom: newDateFrom,
            dateTo: newDateTo,
          })
        );
      }
    }
  }, [startDate, endDate]);

  return (
    <div className={`flex flex-row ${width && width < 480 ? 'flex-wrap mt-2 mb-2 ml-1' : 'ml-2'}`}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          inputFormat='yyyy-MM-dd'
          label='from'
          value={startDate}
          onChange={newValue => {
            setStartDate(newValue);
          }}
          renderInput={params => (
            <TextField
              {...params}
              sx={{ height: `${width && width < 330 ? '70px' : '50px'}`, width: '150px' }}
            />
          )}
        />
      </LocalizationProvider>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          className={`${width && width < 330 ? 'mt-10' : ''}`}
          inputFormat='yyyy-MM-dd'
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
              sx={{
                marginLeft: `${width && width < 320 ? '2px' : '5px'}`,
                height: '50px',
                width: '150px',
              }}
            />
          )}
        />
      </LocalizationProvider>
    </div>
  );
}
