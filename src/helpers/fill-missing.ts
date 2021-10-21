import { globalDateCache, UnifiedDay, UnifiedIsoWeek } from './date-cache';
import { DateRange } from '../data/DateRange';

export function fillAndFilterFromDailyMap<V>(
  unsortedOriginalData: Map<UnifiedDay, V>,
  filler: V,
  dateRange: DateRange
): { key: UnifiedDay; value: V }[] {
  const dateRangeInData = globalDateCache.rangeFromDays(unsortedOriginalData.keys());
  const sortedFilledDays = globalDateCache.daysFromRange({
    // TODO
    min: dateRange.dateFrom ?? dateRangeInData?.min ?? globalDateCache.getDay('2020-01-06'),
    max: dateRange.dateTo ?? dateRangeInData?.max ?? globalDateCache.today(),
  });
  return sortedFilledDays.map(day => ({
    key: day,
    value: unsortedOriginalData.get(day) ?? filler,
  }));
}

export function fillFromWeeklyMap<V>(
  unsortedOriginalData: Map<UnifiedIsoWeek, V>,
  filler: V
): { key: UnifiedIsoWeek; value: V }[] {
  const sortedFilledWeeks = globalDateCache.weeksFromRange(
    globalDateCache.rangeFromWeeks(unsortedOriginalData.keys())
  );
  return sortedFilledWeeks.map(isoWeek => ({
    key: isoWeek,
    value: unsortedOriginalData.get(isoWeek) ?? filler,
  }));
}

export function fillAndFilterFromWeeklyMap<V>(
  unsortedOriginalData: Map<UnifiedIsoWeek, V>,
  filler: V,
  dateRange: DateRange
): { key: UnifiedIsoWeek; value: V }[] {
  const dateRangeInData = globalDateCache.rangeFromWeeks(unsortedOriginalData.keys());
  const sortedFilledWeeks = globalDateCache.weeksFromRange({
    // TODO
    min: dateRange.dateFrom?.isoWeek ?? dateRangeInData?.min ?? globalDateCache.getDay('2020-01-06').isoWeek,
    max: dateRange.dateTo?.isoWeek ?? dateRangeInData?.max ?? globalDateCache.today().isoWeek,
  });
  return sortedFilledWeeks.map(isoWeek => ({
    key: isoWeek,
    value: unsortedOriginalData.get(isoWeek) ?? filler,
  }));
}

export function fillFromPrimitiveMap<K, V>(
  unsortedOriginalData: Map<K, V>,
  possibleKeys: K[],
  filler: V
): { key: K; value: V }[] {
  const possibleKeysSet = new Set(possibleKeys);
  for (const key of unsortedOriginalData.keys()) {
    if (!possibleKeysSet.has(key)) {
      throw new Error(`key ${key} is in unsortedOriginalData but not in possibleKeys`);
    }
  }

  return possibleKeys.map(key => ({ key, value: unsortedOriginalData.get(key) ?? filler }));
}

export const possibleAgeKeys = [
  '0-9',
  '10-19',
  '20-29',
  '30-39',
  '40-49',
  '50-59',
  '60-69',
  '70-79',
  '80+',
  null,
];
