import { UnifiedIsoWeek } from './date-cache';

export const sortBy = (key: string) => {
  return (a: any, b: any) => (a[key] > b[key] ? 1 : b[key] > a[key] ? -1 : 0);
};

export const mean = (array: number[]) => array.reduce((a, b) => a + b) / array.length;

export const pullAll = (a: any[], b: any[]) => {
  let itemsToDeleteSet = new Set([...b]);
  return [...a].filter(item => {
    return !itemsToDeleteSet.has(item);
  });
};

export const times = (n: number, callbackfunction: Function) => {
  return [...Array(n)].map(() => {
    return callbackfunction();
  });
};

export function shuffle(inputArray: any[]) {
  let array = [...inputArray];
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

export function shuffle_UnifiedIsoWeek<T>(inputArray: [UnifiedIsoWeek, number][] | [T, number][]) {
  let array = [...inputArray];
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

export const random = (a = 1, b = 0) => {
  const lower = Math.ceil(Math.min(a, b));
  const upper = Math.floor(Math.max(a, b));
  return Math.floor(lower + Math.random() * (upper - lower + 1));
};

export const capitalize = (string: string) => {
  return string ? string.charAt(0).toUpperCase() + string.slice(1).toLowerCase() : '';
};
