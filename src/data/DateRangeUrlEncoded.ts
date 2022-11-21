import {
  DateRangeSelector,
  FixedDateRangeSelector,
  isSpecialDateRange,
  SpecialDateRange,
  SpecialDateRangeSelector,
} from './DateRangeSelector';
import { globalDateCache } from '../helpers/date-cache';

export type DateRangeUrlEncoded = SpecialDateRange | typeof specificDateRangePattern;

export const specificDateRangePattern = `^from=\\d{4}-\\d{2}-\\d{2}&to=\\d{4}-\\d{2}-\\d{2}$`;
export const specificDateRangeRegEx: RegExp = new RegExp(specificDateRangePattern);

export function isDateRangeEncoded(s: unknown): s is DateRangeUrlEncoded {
  const _s = s as DateRangeUrlEncoded;
  return isSpecialDateRange(_s) || specificDateRangeRegEx.test(_s);
}

export function dateRangeUrlToSelector(dateRangeEncoded: DateRangeUrlEncoded): DateRangeSelector {
  if (isSpecialDateRange(dateRangeEncoded)) {
    return new SpecialDateRangeSelector(dateRangeEncoded);
  }
  const from = dateRangeEncoded.match(/from=(.*)&/);
  const to = dateRangeEncoded.match(/to=(.*)$/);
  return new FixedDateRangeSelector({
    dateFrom: from ? globalDateCache.getDay(from[1]) : undefined,
    dateTo: to ? globalDateCache.getDay(to[1]) : undefined,
  });
}

export function dateRangeUrlFromSelector(selector: DateRangeSelector): DateRangeUrlEncoded {
  if (selector instanceof FixedDateRangeSelector) {
    const { dateFrom, dateTo } = selector.getDateRange();
    return `from=${dateFrom?.string}&to=${dateTo?.string}` as unknown as DateRangeUrlEncoded;
  }
  if (selector instanceof SpecialDateRangeSelector) {
    return selector.mode;
  }
  throw new Error('Unexpected date range selector type');
}

export function submissionDateRangeUrlFromSelector(selector: DateRangeSelector): DateRangeUrlEncoded {
  if (selector instanceof FixedDateRangeSelector) {
    const { dateFrom, dateTo } = selector.getDateRange();
    return `dateSubmittedFrom=${dateFrom?.string}&dateSubmittedTo=${dateTo?.string}` as unknown as DateRangeUrlEncoded;
  }
  if (selector instanceof SpecialDateRangeSelector) {
    return `dateSubmitted=${selector.mode}` as DateRangeUrlEncoded;
  }
  throw new Error('Unexpected date range selector type');
}
