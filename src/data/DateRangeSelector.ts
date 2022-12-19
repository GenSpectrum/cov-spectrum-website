import { DateRange } from './DateRange';
import { globalDateCache } from '../helpers/date-cache';
import dayjs from 'dayjs';
import * as zod from 'zod';

export const dateStringRegex = /\d{4}-\d{2}-\d{2}$/;
export const dateRangeStringRegex = /\d{4}-\d{2}-\d{2} - \d{4}-\d{2}-\d{2}$/;
export const DateStringSchema = zod.string().regex(dateStringRegex);

export interface DateRangeSelector {
  getDateRange(): DateRange;
}

export class FixedDateRangeSelector implements DateRangeSelector {
  constructor(public dateRange: DateRange) {}

  getDateRange(): DateRange {
    return this.dateRange;
  }
}
export const specialDateRanges = [
  'AllTimes',
  'Y2020',
  'Y2021',
  'Y2022',
  'Past2W',
  'Past1M',
  'Past2M',
  'Past3M',
  'Past6M',
] as const;
export type SpecialDateRange = typeof specialDateRanges[number];
export function isSpecialDateRange(s: unknown): s is SpecialDateRange {
  return typeof s === 'string' && (specialDateRanges as readonly string[]).includes(s);
}

export class SpecialDateRangeSelector implements DateRangeSelector {
  constructor(public mode: SpecialDateRange) {}

  getDateRange(): DateRange {
    const daysAgo = (n: number) => globalDateCache.getDayUsingDayjs(dayjs().subtract(n, 'days'));
    const monthsAgo = (n: number) =>
      globalDateCache.getDayUsingDayjs(dayjs().subtract(n, 'months').weekday(0));
    const weeksAgo = (n: number) => globalDateCache.getDayUsingDayjs(dayjs().subtract(n, 'weeks'));
    switch (this.mode) {
      case 'AllTimes':
        return { dateFrom: globalDateCache.getDay('2020-01-06'), dateTo: daysAgo(7) };
      case 'Y2020':
        return {
          dateFrom: globalDateCache.getDay('2020-01-06'),
          dateTo: globalDateCache.getDay('2021-01-03'),
        };
      case 'Y2021':
        return {
          dateFrom: globalDateCache.getDay('2021-01-04'),
          dateTo: globalDateCache.getDay('2022-01-02'),
        };
      case 'Y2022':
        return {
          dateFrom: globalDateCache.getDay('2022-01-03'),
          dateTo: globalDateCache.getDay('2023-01-01'),
        };
      case 'Past2W':
        return { dateFrom: weeksAgo(2), dateTo: daysAgo(7) };
      case 'Past1M':
        return { dateFrom: monthsAgo(1), dateTo: daysAgo(7) };
      case 'Past2M':
        return { dateFrom: monthsAgo(2), dateTo: daysAgo(7) };
      case 'Past3M':
        return { dateFrom: monthsAgo(3), dateTo: daysAgo(7) };
      case 'Past6M':
        return { dateFrom: monthsAgo(6), dateTo: daysAgo(7) };
    }
  }
}

export const FixedDateRangeSelectorEncodedSchema = zod.object({
  dateRange: zod.object({
    dateFrom: DateStringSchema.optional(),
    dateTo: DateStringSchema.optional(),
  }),
});

export const SpecialDateRangeSelectorEncodedSchema = zod.object({
  mode: zod.enum(specialDateRanges),
});

export const DateRangeSelectorEncodedSchema = zod.union([
  FixedDateRangeSelectorEncodedSchema,
  SpecialDateRangeSelectorEncodedSchema,
]);

export function encodeDateRangeSelector(
  selector: DateRangeSelector
): zod.infer<typeof DateRangeSelectorEncodedSchema> {
  if (selector instanceof FixedDateRangeSelector) {
    return FixedDateRangeSelectorEncodedSchema.parse(selector);
  } else if (selector instanceof SpecialDateRangeSelector) {
    return SpecialDateRangeSelectorEncodedSchema.parse(selector);
  }
  throw new Error('Unexpected selector');
}

export function decodeDateRangeSelector(
  encoded: zod.infer<typeof DateRangeSelectorEncodedSchema>
): DateRangeSelector {
  if ('dateRange' in encoded) {
    return new FixedDateRangeSelector({
      dateFrom: encoded.dateRange.dateFrom ? globalDateCache.getDay(encoded.dateRange.dateFrom) : undefined,
      dateTo: encoded.dateRange.dateTo ? globalDateCache.getDay(encoded.dateRange.dateTo) : undefined,
    });
  } else {
    return new SpecialDateRangeSelector(encoded.mode);
  }
}

export function addDateRangeSelectorToUrlSearchParams(selector: DateRangeSelector, params: URLSearchParams) {
  const { dateFrom, dateTo } = selector.getDateRange();
  if (dateFrom) {
    params.set('dateFrom', dateFrom.string);
  }
  if (dateTo) {
    params.set('dateTo', dateTo.string);
  }
}

const fields_submisison_date = ['dateSubmittedFrom', 'dateSubmittedTo', 'dateSubmitted'] as const;

export function addSubmittedDateRangeSelectorToUrlParams(
  params: URLSearchParams,
  selector?: DateRangeSelector
) {
  for (const field of fields_submisison_date) {
    params.delete(field);
  }

  if (selector) {
    if (selector instanceof SpecialDateRangeSelector) {
      if (selector.mode !== 'AllTimes') {
        params.set('dateSubmitted', selector.mode);
        return;
      }
    } else {
      const dateRange = selector.getDateRange();
      dateRange.dateFrom && params.set('dateSubmittedFrom', dateRange.dateFrom.string);
      dateRange.dateTo && params.set('dateSubmittedTo', dateRange.dateTo.string);
    }
  }
}

export function readSubmissionDateRangeFromUrlSearchParams(params: URLSearchParams): string {
  let res: string = '';
  if (params.has('dateSubmitted')) {
    res = `dateSubmitted=${params.get('dateSubmitted')}`;
  } else if (params.has('dateSubmittedFrom') && params.has('dateSubmittedTo')) {
    res = `dateSubmittedFrom=${params.get('dateSubmittedFrom')}&dateSubmittedTo=${params.get(
      'dateSubmittedTo'
    )}`;
  }
  // ^dateSubmittedFrom=\\d{4}-\\d{2}-\\d{2}&dateSubmittedTo=\\d{4}-\\d{2}-\\d{2}$

  return res;
}

export function specialDateRangeToString(dateRange: SpecialDateRange): string {
  switch (dateRange) {
    case 'AllTimes':
      return 'All times';
    case 'Past2W':
      return 'Past 2 weeks';
    case 'Past1M':
      return 'Past month';
    case 'Past2M':
      return 'Past 2 months';
    case 'Past3M':
      return 'Past 3 months';
    case 'Past6M':
      return 'Past 6 months';
    case 'Y2020':
      return '2020';
    case 'Y2021':
      return '2021';
    case 'Y2022':
      return '2022';
  }
}
