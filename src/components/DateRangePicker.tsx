import TextField from '@mui/material/TextField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import React, { useEffect, useState } from 'react';
import { HeaderDateRangeSelect } from './HeaderDateRangeSelect';
import { useExploreUrl } from '../helpers/explore-url';
import dayjs from 'dayjs';
import { DateRangeSelector, FixedDateRangeSelector } from '../data/DateRangeSelector';
import { globalDateCache } from '../helpers/date-cache';
import { useResizeDetector } from 'react-resize-detector';

interface Props {
  dateRangeSelector: DateRangeSelector;
  setDateRangeSelector?: React.Dispatch<React.SetStateAction<DateRangeSelector>>;
  setSubmissionDateRangeSelector?: React.Dispatch<React.SetStateAction<DateRangeSelector>>;
  setSpecialSubmissionDateRaw?: React.Dispatch<React.SetStateAction<string | null>>;
}

const minimumDate: Date = new Date('2020-01-06'); // first day of first week of 2020
const today = new Date();

export const DateRangePicker = ({
  dateRangeSelector,
  setDateRangeSelector,
  setSubmissionDateRangeSelector,
  setSpecialSubmissionDateRaw,
}: Props) => {
  const { width, ref } = useResizeDetector<HTMLDivElement>();

  const [startDate, setStartDate] = React.useState<Date | null>(null);
  const [endDate, setEndDate] = React.useState<Date | null>(null);

  const { dateFrom, dateTo } = dateRangeSelector.getDateRange();
  const initialStartDate = dateFrom ? dateFrom.dayjs.toDate() : minimumDate;
  const initialEndDate = dateTo ? dateTo.dayjs.toDate() : today;
  const prevDateFrom = globalDateCache.getDayUsingDayjs(dayjs(initialStartDate));
  const prevDateTo = globalDateCache.getDayUsingDayjs(dayjs(initialEndDate));
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([initialStartDate, initialEndDate]);
  const [raw, setRaw] = useState<string>('2020-01-06');
  const dateRegex = /[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
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

      if (setSubmissionDateRangeSelector) {
        setSubmissionDateRangeSelector(
          new FixedDateRangeSelector({
            dateFrom: newDateFrom,
            dateTo: newDateTo,
          })
        );
        return;
      }

      if (prevDateFrom.string !== newDateFrom.string || prevDateTo.string !== newDateTo.string) {
        exploreUrl?.setDateRange(
          new FixedDateRangeSelector({
            dateFrom: newDateFrom,
            dateTo: newDateTo,
          })
        );
      }

      if (setDateRangeSelector) {
        setDateRangeSelector(
          new FixedDateRangeSelector({
            dateFrom: newDateFrom,
            dateTo: newDateTo,
          })
        );
      }
    }
  };

  useEffect(() => {
    if (startDate && endDate && raw.match(dateRegex)) {
      changeDate();
    }
  }, [dateRange]);

  useEffect(() => {
    if (startDate && endDate) {
      setDateRange([startDate, endDate]);
    }
  }, [startDate, endDate]);

  return (
    <>
      <div ref={ref} className='w-full flex flex-row items-center flex-wrap'>
        <HeaderDateRangeSelect
          exploreUrl={exploreUrl}
          setDateRangeSelector={setDateRangeSelector}
          setSubmissionDateRangeSelector={setSubmissionDateRangeSelector}
          setSpecialSubmissionDateRaw={setSpecialSubmissionDateRaw}
        />

        <div className={`flex flex-row ${width && width < 480 ? 'flex-wrap mt-2 mb-2 ml-1' : 'ml-2'}`}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              inputFormat='yyyy-MM-dd'
              label='from'
              value={startDate}
              onChange={(value, keyboardInputValue) => {
                if (keyboardInputValue) {
                  setRaw(keyboardInputValue);
                }
                setStartDate(value);
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
      </div>
    </>
  );
};
