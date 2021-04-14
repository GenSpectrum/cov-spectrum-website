import { globalDateCache, UnifiedIsoWeek } from './date-cache';

export function fillFromWeeklyMap<T>(
  unsortedOriginalData: Map<UnifiedIsoWeek, T>,
  filler: T
): (T & { isoWeek: UnifiedIsoWeek })[] {
  const sortedFilledWeeks = globalDateCache.weeksFromRange(
    globalDateCache.rangeFromWeeks(unsortedOriginalData.keys())
  );
  return sortedFilledWeeks.map(isoWeek => ({ ...(unsortedOriginalData.get(isoWeek) ?? filler), isoWeek }));
}

export function fillFromPrimitiveMap<K, V>(
  unsortedOriginalData: Map<K, V>,
  possibleKeys: K[],
  filler: V
): (V & { key: K })[] {
  const possibleKeysSet = new Set(possibleKeys);
  for (const key of unsortedOriginalData.keys()) {
    if (!possibleKeysSet.has(key)) {
      throw new Error(`key ${key} is in unsortedOriginalData but not in possibleKeys`);
    }
  }

  return possibleKeys.map(key => ({ ...(unsortedOriginalData.get(key) ?? filler), key }));
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
