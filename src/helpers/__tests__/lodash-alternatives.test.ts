import * as lodashAlternatives from '../lodash_alternatives';
import { globalDateCache, UnifiedIsoWeek } from '../date-cache';
import isEqual from '../isEqual';

// data for the tests
const fromTemplate = (template: [string, number][]): [UnifiedIsoWeek, number][] =>
  template.map(([yearWeek, value]) => [globalDateCache.getIsoWeek(yearWeek), value]);

const inputFromTemplate = fromTemplate([
  ['2012-07', 20],
  ['2012-08', 13],
  ['2012-09', 13],
  ['2012-10', 13],
]);

const numbersArray: number[] = [2, 44, 69, 345, 394, 543, 4, 0, 2, 8];
const dataToBeSorted: any[] = [
  {
    id: 25,
    name: 'Haldór Laxness',
    createdAt: '2016-04-12T12:48:55.000Z',
    updatedAt: '2017-04-12T12:48:55.000Z',
  },
  {
    id: 1,
    name: 'Ivo Andrić',
    createdAt: '2020-04-12T11:20:03.000Z',
    updatedAt: '2021-09-12T11:25:03.000Z',
  },
  {
    id: 3,
    name: 'Robertson Davies',
    createdAt: '2017-04-12T11:24:03.000Z',
    updatedAt: '2021-08-12T11:25:03.000Z',
  },
];

// sorted by 'createdAt'
const expectedSortingResult: any[] = [
  {
    id: 25,
    name: 'Haldór Laxness',
    createdAt: '2016-04-12T12:48:55.000Z',
    updatedAt: '2017-04-12T12:48:55.000Z',
  },
  {
    id: 3,
    name: 'Robertson Davies',
    createdAt: '2017-04-12T11:24:03.000Z',
    updatedAt: '2021-08-12T11:25:03.000Z',
  },
  {
    id: 1,
    name: 'Ivo Andrić',
    createdAt: '2020-04-12T11:20:03.000Z',
    updatedAt: '2021-09-12T11:25:03.000Z',
  },
];

// nested objects to compare with isEqual
type customType = {
  name: string;
  quantity: number;
  isAvailable: boolean;
};

type objectToCompare = {
  item1: string;
  item2: number;
  item3: any[];
  item4: string[];
  item5: { array: number[] };
  item6: customType;
};

const object1: objectToCompare = {
  item1: 'string',
  item2: 1,
  item3: [1, 2, 3, 4, { string: 'string', number: 1 }],
  item4: ['1', '2', '3'],
  item5: { array: [5, 4, 5, 6] },
  item6: { name: 'someName', quantity: 3, isAvailable: true },
};

const object2: objectToCompare = {
  item1: 'string',
  item2: 1,
  item3: [1, 2, 3, 4, { string: 'string', number: 1 }],
  item4: ['1', '2', '3'],
  item5: { array: [5, 4, 5, 6] },
  item6: { name: 'someName', quantity: 3, isAvailable: true },
};

const object3: objectToCompare = {
  item1: 'string',
  item2: 1,
  item3: [1, 2, 3, 4, { string: 'string', number: 2 }],
  item4: ['1', '2', '3'],
  item5: { array: [5, 4, 5, 6] },
  item6: { name: 'someName', quantity: 3, isAvailable: true },
};

describe('Array manipulation tests', () => {
  test('mean() function returns the mean value of an array', () => {
    expect(lodashAlternatives.mean(numbersArray)).toBe(141.1);
  });

  test('sortBy() sorts an array in ascending order by a given key (createdAT)', () => {
    /*
    Unlike the lodash version, this implementation modifies the given array. 
    That is why we use concat() to create a copy.
    */
    const sortedData: any[] = dataToBeSorted.concat().sort(lodashAlternatives.sortBy('createdAt'));
    expect(sortedData).toStrictEqual(expectedSortingResult);
  });

  test('pullAll() removes the given values from the numbersArray', () => {
    const resultArray: number[] = lodashAlternatives.pullAll(numbersArray, [2, 345, 4, 0, 2, 8]);
    expect(resultArray).toStrictEqual([44, 69, 394, 543]);
  });

  test('shuffle() shuffles the given array', () => {
    const resultArray: number[] = lodashAlternatives.shuffle(numbersArray);
    expect(resultArray).not.toStrictEqual(numbersArray);
  });

  test('shuffle_UnifiedIsoWeek() shuffles the given array', () => {
    const resultArray: [UnifiedIsoWeek, number][] =
      lodashAlternatives.shuffle_UnifiedIsoWeek(inputFromTemplate);
    expect(resultArray).not.toStrictEqual(inputFromTemplate);
  });
});

describe('Strings and numbers manipulation tests', () => {
  test('random() returns random numbers', () => {
    const randomNumber1: number = lodashAlternatives.random(0, 10000);
    const randomNumber2: number = lodashAlternatives.random(0, 10000);
    const randomNumber3: number = lodashAlternatives.random(0, 10000);
    expect(randomNumber1).not.toBe(randomNumber2);
    expect(randomNumber2).not.toBe(randomNumber3);
    expect(randomNumber1).not.toBe(randomNumber3);
  });

  test('capitalize() converts the first character of string to upper case and the remaining to lower case', () => {
    expect(lodashAlternatives.capitalize('you are so COOL!')).toEqual('You are so cool!');
  });
});

describe('Testint the times() function', () => {
  test('times() invokes the iteratee n times, returning an array of the results of each invocation', () => {
    let num: number = 0;
    const resultArray = lodashAlternatives.times(4, () => (num += 2));
    expect(resultArray).toStrictEqual([2, 4, 6, 8]);
  });
});

describe('Testint isEqual()', () => {
  test('isEqual() performs a deep comparison of nested objects', () => {
    expect(isEqual(object1, object2)).toBe(true);
    expect(isEqual(object1, object3)).toBe(false);
  });
});
