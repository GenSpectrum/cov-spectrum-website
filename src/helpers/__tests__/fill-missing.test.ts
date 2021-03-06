import { shuffle, sortBy } from 'lodash';
import { fillAgeKeyedApiData, fillGroupedWeeklyApiData, fillWeeklyApiData } from '../fill-missing';
import { addDayToYearWeek } from '../week';

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

  const fromTemplate = (template: [string, number][]) =>
    template.map(([yearWeek, y]) => ({ x: addDayToYearWeek(yearWeek), y }));

  for (const c of cases) {
    // eslint-disable-next-line jest/valid-title
    test(c.label, () => {
      const expectedOutput = fromTemplate(c.output);
      for (let i = 0; i < 5; i++) {
        const shuffledInput = shuffle(fromTemplate(c.input));
        expect(fillWeeklyApiData<number>(shuffledInput, c.fillValue)).toEqual(expectedOutput);
      }
    });
  }
});

describe('fillGroupedWeeklyApiData', () => {
  for (let i = 0; i < 5; i++) {
    const shuffledInput = shuffle([
      { x: { country: 'Germany', week: addDayToYearWeek('2020-25') }, y: 50 },
      { x: { country: 'Switzerland', week: addDayToYearWeek('2020-18') }, y: 123 },
      { x: { country: 'Germany', week: addDayToYearWeek('2020-27') }, y: 60 },
    ]);
    const actualSortedOutput = sortBy(fillGroupedWeeklyApiData(shuffledInput, 'country', 0), [
      v => v.x.country,
      v => v.x.week.firstDayInWeek,
    ]);
    expect(actualSortedOutput).toEqual([
      { x: { country: 'Germany', week: addDayToYearWeek('2020-25') }, y: 50 },
      { x: { country: 'Germany', week: addDayToYearWeek('2020-26') }, y: 0 },
      { x: { country: 'Germany', week: addDayToYearWeek('2020-27') }, y: 60 },
      { x: { country: 'Switzerland', week: addDayToYearWeek('2020-18') }, y: 123 },
    ]);
  }
});

describe('fillAgeKeyedApiData', () => {
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
      output: [
        ['0-9', 123],
        ['10-19', 123],
        ['20-29', 123],
        ['30-39', 123],
        ['40-49', 123],
        ['50-59', 123],
        ['60-69', 123],
        ['70-79', 123],
        ['80+', 123],
      ],
    },
    {
      label: 'input with some ages',
      input: [
        ['20-29', 18],
        ['50-59', 30],
      ],
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
      ],
    },
  ];

  const fromTemplate = (template: [string, number][]) => template.map(([x, y]) => ({ x, y }));

  for (const c of cases) {
    // eslint-disable-next-line jest/valid-title
    test(c.label, () => {
      const expectedOutput = fromTemplate(c.output);
      for (let i = 0; i < 5; i++) {
        const shuffledInput = shuffle(fromTemplate(c.input));
        expect(fillAgeKeyedApiData(shuffledInput, c.fillValue)).toEqual(expectedOutput);
      }
    });
  }
});
