import { UnifiedDay } from '../helpers/date-cache';

export const getDisplayDateRange = (r: DateRange | undefined) => {
  if (!r) return '';
  if (r.dateFrom && r.dateTo) {
    return `from ${r.dateFrom.string} to ${r.dateTo.string}`;
  } else if (r.dateFrom) {
    return `since ${r.dateFrom.string}`;
  }
};

export type DateRange = {
  dateFrom?: UnifiedDay;
  dateTo?: UnifiedDay;
};

export function isInDateRange({ dateFrom, dateTo }: DateRange, date: UnifiedDay): boolean {
  if (dateFrom && date.dayjs.isBefore(dateFrom.dayjs, 'day')) {
    return false;
  }
  if (dateTo && date.dayjs.isAfter(dateTo.dayjs, 'day')) {
    return false;
  }
  return true;
}
