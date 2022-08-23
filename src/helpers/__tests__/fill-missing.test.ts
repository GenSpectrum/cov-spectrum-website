import { shuffle } from '../lodash_alternatives';
import { globalDateCache, UnifiedIsoWeek } from '../date-cache';
import { fillFromPrimitiveMap, fillFromWeeklyMap, possibleAgeKeys } from '../fill-missing';

describe('fillWeeklyApiData', () => {
  interface Case {
    label: string;
    input: [string, number][];
    fillValue: number;
    output: [string, number][];
  }
  const cases: Case[] = [
    {
      label: 'empty input',
      input: [],
      fillValue: 123,
      output: [],
    },
    {
      label: '1 week',
      input: [['2012-07', 20]],
      fillValue: 123,
      output: [['2012-07', 20]],
    },
    {
      label: '2 consecutive weeks',
      input: [
        ['2012-07', 20],
        ['2012-08', 13],
      ],
      fillValue: 123,
      output: [
        ['2012-07', 20],
        ['2012-08', 13],
      ],
    },
    {
      label: '2 weeks with space in between',
      input: [
        ['2012-07', 20],
        ['2012-11', 13],
      ],
      fillValue: 123,
      output: [
        ['2012-07', 20],
        ['2012-08', 123],
        ['2012-09', 123],
        ['2012-10', 123],
        ['2012-11', 13],
      ],
    },
    {
      label: 'multiple weeks with no space in between',
      input: [
        ['2012-07', 20],
        ['2012-08', 13],
        ['2012-09', 13],
        ['2012-10', 13],
      ],
      fillValue: 123,
      output: [
        ['2012-07', 20],
        ['2012-08', 13],
        ['2012-09', 13],
        ['2012-10', 13],
      ],
    },
    {
      label: 'crossing a year border (52 weeks)',
      input: [
        ['2012-50', 8],
        ['2013-02', 3],
      ],
      fillValue: 0,
      output: [
        ['2012-50', 8],
        ['2012-51', 0],
        ['2012-52', 0],
        ['2013-01', 0],
        ['2013-02', 3],
      ],
    },
    {
      label: 'crossing a year border (53 weeks)',
      input: [
        ['2015-52', 8],
        ['2016-01', 3],
      ],
      fillValue: 0,
      output: [
        ['2015-52', 8],
        ['2015-53', 0],
        ['2016-01', 3],
      ],
    },
  ];

  type Output = { key: UnifiedIsoWeek; value: number }[];

  const fromTemplate = (template: [string, number][]): [UnifiedIsoWeek, number][] =>
    template.map(([yearWeek, value]) => [globalDateCache.getIsoWeek(yearWeek), value]);

  // https://github.com/facebook/jest/issues/10577
  function assertOutputEqual(a: Output, b: Output) {
    const convertForEquality = (output: Output) =>
      output.map(({ key, value }) => [key.yearWeekString, value]);
    expect(convertForEquality(a)).toEqual(convertForEquality(b));
    expect(a.every((va, i) => va.key === b[i].key)).toBe(true);
  }

  for (const c of cases) {
    // eslint-disable-next-line jest/valid-title
    test(c.label, () => {
      const expectedOutput: Output = fromTemplate(c.output).map(([key, value]) => ({ key, value }));
      for (let i = 0; i < 5; i++) {
        const inputMap = new Map<UnifiedIsoWeek, number>(shuffle(fromTemplate(c.input)));
        const actualOutput = fillFromWeeklyMap(inputMap, c.fillValue);
        assertOutputEqual(actualOutput, expectedOutput);
      }
    });
  }
});

describe('fillFromPrimitiveMap', () => {
  interface Case<T> {
    label: string;
    input: [T, number][];
    possibleKeys: T[];
    fillValue: number;
    output: [T, number][];
  }
  const cases: Case<unknown>[] = [
    {
      label: 'empty input and possibleKeys',
      input: [],
      possibleKeys: [],
      fillValue: 123,
      output: [],
    },
    {
      label: 'empty input and various possibleKeys',
      input: [],
      possibleKeys: ['123', 15, null, 12, undefined],
      fillValue: 123,
      output: [
        ['123', 123],
        [15, 123],
        [null, 123],
        [12, 123],
        [undefined, 123],
      ],
    },
    {
      label: 'possibleKeys without null',
      input: [],
      possibleKeys: ['abc', 'def'],
      fillValue: 123,
      output: [
        ['abc', 123],
        ['def', 123],
      ],
    },
    {
      label: 'different fill value',
      input: [
        ['abc', 123],
        ['def', 0],
      ],
      possibleKeys: ['abc', 'ABC', 'def'],
      fillValue: 10,
      output: [
        ['abc', 123],
        ['ABC', 10],
        ['def', 0],
      ],
    },
    {
      label: 'input with some ages',
      input: [
        ['20-29', 18],
        ['50-59', 30],
      ],
      possibleKeys: possibleAgeKeys,
      fillValue: 123,
      output: [
        ['0-9', 123],
        ['10-19', 123],
        ['20-29', 18],
        ['30-39', 123],
        ['40-49', 123],
        ['50-59', 30],
        ['60-69', 123],
        ['70-79', 123],
        ['80+', 123],
        [null, 123],
      ],
    },
  ];

  const fromTemplate = <T>(template: [T, number][]) => template.map(([x, y]): [T, number] => [x, y]);

  for (const c of cases) {
    // eslint-disable-next-line jest/valid-title
    test(c.label, () => {
      const expectedOutput = fromTemplate(c.output).map(([key, value]) => ({ key, value }));
      for (let i = 0; i < 5; i++) {
        const inputMap = new Map(shuffle(fromTemplate(c.input)));
        expect(fillFromPrimitiveMap(inputMap, c.possibleKeys, c.fillValue)).toEqual(expectedOutput);
      }
    });
  }

  test('throws when value is not in possibleKeys', () => {
    expect(() =>
      fillFromPrimitiveMap(
        new Map(
          fromTemplate([
            ['10-19', 100],
            ['25-28', 50],
          ])
        ),
        ['10-19', '20-29', '30-39'],
        0
      )
    ).toThrow();
  });
});
