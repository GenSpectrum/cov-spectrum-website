import { UnifiedDay } from '../helpers/date-cache';

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
