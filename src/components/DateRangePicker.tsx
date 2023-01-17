import * as React from 'react';
import TextField from '@mui/material/TextField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useResizeDetector } from 'react-resize-detector';
import {
  DateRangeSelector,
  FixedDateRangeSelector,
  isSpecialDateRange,
  specialDateRanges,
  SpecialDateRangeSelector,
  specialDateRangeToString,
} from '../data/DateRangeSelector';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { globalDateCache } from '../helpers/date-cache';
import dayjs from 'dayjs';
import { Form } from 'react-bootstrap';

interface Props {
  dateRangeSelector: DateRangeSelector;
  onChangeDate?: (dateRange: DateRangeSelector) => void;
}

export default function DateRangePicker({ dateRangeSelector, onChangeDate }: Props) {
  const { width, ref } = useResizeDetector<HTMLDivElement>();

  const [currentSelector, setCurrentSelector] = useState(dateRangeSelector);

  useEffect(() => {
    setCurrentSelector(dateRangeSelector);
  }, [dateRangeSelector]);

  const { dateFromDate, dateToDate, specialDateRangeSelectValue } = useMemo(() => {
    const dateRange = currentSelector.getDateRange();
    return {
      dateFromDate: dateRange.dateFrom?.dayjs.toDate(),
      dateToDate: dateRange.dateTo?.dayjs.toDate(),
      specialDateRangeSelectValue:
        currentSelector instanceof SpecialDateRangeSelector ? currentSelector.mode : 'custom',
    };
  }, [currentSelector]);

  const handleDateChange = useCallback(
    (newValue: Date | undefined | null, domain: 'dateFrom' | 'dateTo') => {
      if (!newValue) {
        return;
      }

      const dayjsDay = dayjs(newValue);
      if (!dayjsDay.isValid()) {
        return;
      }
      const newValueUnified = globalDateCache.getDayUsingDayjs(dayjsDay);
      const newDateRange = {
        ...currentSelector.getDateRange(),
        [domain]: newValueUnified,
      };
      const newSelector = new FixedDateRangeSelector(newDateRange);
      setCurrentSelector(newSelector);
      if (
        newDateRange.dateFrom &&
        newDateRange.dateTo &&
        newDateRange.dateFrom.dayjs.isBefore(newDateRange.dateTo.dayjs)
      ) {
        if (onChangeDate) {
          onChangeDate(newSelector);
        }
      }
    },
    [currentSelector, onChangeDate]
  );

  const handleSpecialDateRangeChange = useCallback(
    (event: React.ChangeEvent<{ value: unknown }>) => {
      const value = event.target.value;
      if (isSpecialDateRange(value)) {
        const newSelector = new SpecialDateRangeSelector(value);
        setCurrentSelector(newSelector);
        if (onChangeDate) {
          onChangeDate(newSelector);
        }
      }
    },
    [onChangeDate]
  );

  return (
    <div ref={ref} className='w-full flex flex-row items-center flex-wrap'>
      <Form>
        <Form.Control
          as='select'
          id='dateRangeSelect'
          value={specialDateRangeSelectValue}
          onChange={handleSpecialDateRangeChange}
          className='rounded mt-1'
          style={{ height: '55px', marginRight: '5px' }}
        >
          <option value='custom'>Custom</option>
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
            value={dateFromDate}
            onChange={newValue => {
              handleDateChange(newValue, 'dateFrom');
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
            value={dateToDate}
            onChange={newValue => {
              handleDateChange(newValue, 'dateTo');
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
