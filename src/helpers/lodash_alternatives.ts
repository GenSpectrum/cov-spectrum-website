import { UnifiedIsoWeek } from './date-cache';

/*
sortBy(collection, [iteratees=[_.identity]])
Native alternative for the lodash sortBy function: https://www.npmjs.com/package/lodash.sortby
Sorts an array of elements in ascending order by the results of running each element 
in a collection through each iteratee. This method  preserves the original sort order of equal elements. 
The iteratees are invoked with one argument: (value).
Unlike the lodash version, this implementation modifies the given array.
*/
export const sortBy = (key: string) => {
  return (a: any, b: any) => (a[key] > b[key] ? 1 : b[key] > a[key] ? -1 : 0);
};

/*
Native alternative for the lodash mean function: https://lodash.com/docs/4.17.15#mean
Computes the mean of the values in array.
*/
export const mean = (array: number[]) => array.reduce((a, b) => a + b) / array.length;

/*
pullAll(array, values)
Native alternative for the lodash pullAll function: https://lodash.com/docs/4.17.15#pullAll
Accepts an array of values to remove from an array.
Unlike lodash, where the function mutates the array, this implementation creates and returns its copy. 
*/

export const pullAll = (a: any[], b: any[]) => {
  let itemsToDeleteSet = new Set([...b]);
  return [...a].filter(item => {
    return !itemsToDeleteSet.has(item);
  });
};

/*
Native alternative for the lodash times function: https://lodash.com/docs/4.17.15#times
Invokes the iteratee n times, 
returning an array of the results of each invocation. 

*/
export const times = (n: number, callbackfunction: Function) => {
  return [...Array(n)].map(() => {
    return callbackfunction();
  });
};

/*
Native alternative for the lodash shuffle function: https://lodash.com/docs/4.17.15#shuffle
Creates an array of shuffled values of the given array. 
The function shuffles the indexes using the js Math.random(),
 while the lodash version uses the Fisher-Yates shuffle.
*/
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

/*
The above shuffle function modified in order 
to be able to deal whith the specific structure: [UnifiedIsoWeek, number][] | [T, number][]
*/
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

/*
A native alternative for the lodash random function: https://lodash.com/docs/4.17.15#random
Produces a random number between two parameter values: the inclusive lower and upper bounds.
*/
export const random = (a = 1, b = 0) => {
  const lower = Math.ceil(Math.min(a, b));
  const upper = Math.floor(Math.max(a, b));
  return Math.floor(lower + Math.random() * (upper - lower + 1));
};

/*
https://lodash.com/docs/4.17.15#capitalize
Converts the first character of string to upper case and the remaining to lower case.
*/

export const capitalize = (string: string) => {
  return string ? string.charAt(0).toUpperCase() + string.slice(1).toLowerCase() : '';
};
