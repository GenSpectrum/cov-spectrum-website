import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { globalDateCache } from '../helpers/date-cache';
import dayjs from 'dayjs';
import { Form } from 'react-bootstrap';
import { DateRange } from '../data/DateRange';

interface Props {
  dateRangeSelector: DateRangeSelector;
  onChangeDate?: (dateRange: DateRangeSelector) => void;
}

export default function DateRangePicker({ dateRangeSelector, onChangeDate }: Props) {
  const { width, ref } = useResizeDetector<HTMLDivElement>();
  const {
    fromDate,
    toDate,
    specialDateRangeSelectValue,
    handleFromDateChange,
    handleToDateChange,
    handleSpecialDateRangeChange,
  } = useDateRangerPickerDates(dateRangeSelector, onChangeDate);

  return (
    <div ref={ref} className='w-full flex flex-row items-center flex-wrap'>
      <SpecialDateRangeForm
        specialDateRangeSelectValue={specialDateRangeSelectValue}
        handleSpecialDateRangeChange={handleSpecialDateRangeChange}
      />
      <div className={`flex flex-row ${width && width < 480 ? 'flex-wrap mt-2 mb-2 ml-1' : 'ml-2'}`}>
        <DateFromPicker
          dateFromDate={fromDate}
          handleDateChange={handleFromDateChange}
          height={width && width < 330 ? '70px' : '50px'}
        />
        <DateToPicker toDate={toDate} handleDateChange={handleToDateChange} width={width} />
      </div>
    </div>
  );
}

function SpecialDateRangeForm({
  specialDateRangeSelectValue,
  handleSpecialDateRangeChange,
}: {
  specialDateRangeSelectValue: string;
  handleSpecialDateRangeChange: (event: React.ChangeEvent<{ value: unknown }>) => void;
}) {
  return (
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
  );
}

function DateFromPicker({
  dateFromDate,
  handleDateChange,
  height,
}: {
  dateFromDate: Date | undefined;
  handleDateChange: (newValue: Date | undefined | null) => void;
  height: string;
}) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        inputFormat='yyyy-MM-dd'
        label='from'
        value={dateFromDate}
        onChange={handleDateChange}
        renderInput={params => <TextField {...params} sx={{ height, width: '150px' }} />}
      />
    </LocalizationProvider>
  );
}

function DateToPicker({
  toDate,
  handleDateChange,
  width,
}: {
  toDate: Date | undefined;
  handleDateChange: (newValue: Date | undefined | null) => void;
  width: number | undefined;
}) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        className={`${width && width < 330 ? 'mt-10' : ''}`}
        inputFormat='yyyy-MM-dd'
        label='to'
        value={toDate}
        onChange={handleDateChange}
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
  );
}

function useDateRangerPickerDates(
  dateRangeSelector: DateRangeSelector,
  onChangeDate: ((dateRange: DateRangeSelector) => void) | undefined
) {
  const [currentSelector, setCurrentSelector] = useState(dateRangeSelector);

  useEffect(() => {
    setCurrentSelector(dateRangeSelector);
  }, [dateRangeSelector]);

  const { fromDate, toDate, specialDateRangeSelectValue } = useMemo(() => {
    const dateRange = currentSelector.getDateRange();
    return {
      fromDate: dateRange.dateFrom?.dayjs.toDate(),
      toDate: dateRange.dateTo?.dayjs.toDate(),
      specialDateRangeSelectValue:
        currentSelector instanceof SpecialDateRangeSelector ? currentSelector.mode : 'custom',
    };
  }, [currentSelector]);

  const handleDateChange = useCallback(
    (newValue: Date | undefined | null, dateRangeKeyToChange: keyof DateRange) => {
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
        [dateRangeKeyToChange]: newValueUnified,
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

  return {
    fromDate,
    toDate,
    specialDateRangeSelectValue,
    handleFromDateChange: (newValue: Date | undefined | null) => handleDateChange(newValue, 'dateFrom'),
    handleToDateChange: (newValue: Date | undefined | null) => handleDateChange(newValue, 'dateTo'),
    handleSpecialDateRangeChange,
  };
}
