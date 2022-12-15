import * as React from 'react';
import TextField from '@mui/material/TextField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useResizeDetector } from 'react-resize-detector';
import {
  DateRangeSelector,
  FixedDateRangeSelector,
  SpecialDateRange,
  SpecialDateRangeSelector,
  specialDateRangeToString,
} from '../data/DateRangeSelector';
import { useEffect, useState } from 'react';
import { globalDateCache } from '../helpers/date-cache';
import dayjs from 'dayjs';
import { Form } from 'react-bootstrap';
import { dateRangeUrlToSelector, isDateRangeEncoded } from '../data/DateRangeUrlEncoded';

const minimumDate: Date = new Date('2020-01-06'); // first day of first week of 2020
const today = new Date();

interface Props {
  dateRangeSelector: DateRangeSelector;
  onChangeDate?: Function;
}

export default function BasicDatePicker({ dateRangeSelector, onChangeDate }: Props) {
  const { width, ref } = useResizeDetector<HTMLDivElement>();

  const { dateFrom, dateTo } = dateRangeSelector.getDateRange();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [specialDate, setSpecialDate] = useState<string>('Past6M');

  useEffect(() => {
    if (dateRangeSelector instanceof SpecialDateRangeSelector) {
      setSpecialDate(dateRangeSelector.mode);
      const { dateFrom, dateTo } = dateRangeUrlToSelector(dateRangeSelector.mode).getDateRange();
      if (dateFrom && dateTo) {
        setStartDate(dateFrom.dayjs.toDate());
        setEndDate(dateTo.dayjs.toDate());
      }
    } else {
      const startDate = dateFrom ? dateFrom.dayjs.toDate() : minimumDate;
      const endDate = dateTo ? dateTo.dayjs.toDate() : today;
      setStartDate(startDate);
      setEndDate(endDate);
    }
  }, [dateRangeSelector, dateFrom, dateTo]);

  const handleDateChange = (newValue: Date | null, domain: 'start' | 'end') => {
    if (domain === 'start') {
      setStartDate(newValue);
    } else {
      setEndDate(newValue);
    }
    if (startDate && endDate && startDate <= endDate) {
      const newDateFrom = globalDateCache.getDayUsingDayjs(dayjs(startDate));
      const newDateTo = globalDateCache.getDayUsingDayjs(dayjs(endDate));
      if (onChangeDate) {
        onChangeDate(
          new FixedDateRangeSelector({
            dateFrom: newDateFrom,
            dateTo: newDateTo,
          })
        );
      }
    }
  };

  const specialDateRanges: SpecialDateRange[] = [
    'AllTimes',
    'Y2020',
    'Y2021',
    'Y2022',
    'Past2W',
    'Past1M',
    'Past2M',
    'Past3M',
    'Past6M',
  ];

  const handleSpecialDateRangeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    if (isDateRangeEncoded(event.target.value)) {
      setSpecialDate(event.target.value);
      const { dateFrom, dateTo } = dateRangeUrlToSelector(event.target.value).getDateRange();
      if (dateFrom && dateTo) {
        setStartDate(dateFrom.dayjs.toDate());
        setEndDate(dateTo.dayjs.toDate());
      }
      if (onChangeDate) {
        onChangeDate(dateRangeUrlToSelector(event.target.value));
      }
    }
  };

  return (
    <div ref={ref} className='w-full flex flex-row items-center flex-wrap'>
      <Form>
        <Form.Control
          as='select'
          id='dateRangeSelect'
          value={specialDate}
          onChange={handleSpecialDateRangeChange}
          className='rounded mt-1'
          style={{ height: '55px', marginRight: '5px' }}
        >
          {specialDateRanges.map(d => (
            <option value={d} key={specialDateRangeToString(d)}>
              {specialDateRangeToString(d)}
            </option>
          ))}
        </Form.Control>
      </Form>
      <div className={`flex flex-row ${width && width < 480 ? 'flex-wrap mt-2 mb-2 ml-1' : 'ml-2'}`}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            inputFormat='yyyy-MM-dd'
            label='from'
            value={startDate}
            onChange={newValue => {
              handleDateChange(newValue, 'start');
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
            onChange={newValue => {
              handleDateChange(newValue, 'end');
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
    </div>
  );
}
