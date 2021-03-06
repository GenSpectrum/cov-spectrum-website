import { any } from 'zod';
import { CountAndProportionWithCI } from '../services/api-types';

export type EntryWithoutCI<T extends { y: CountAndProportionWithCI }> = Omit<T, 'y'> & {
  y: { count: number; proportion: number };
};

export function removeCIFromEntry<T extends { y: CountAndProportionWithCI }>(entry: T): EntryWithoutCI<T> {
  return {
    ...entry,
    y: { count: entry.y.count, proportion: entry.y.proportion.value },
  };
}
