import { shuffle } from 'lodash';
import { fillWeeklyApiData } from '../fill-missing';
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
      for (let i = 0; i < 10; i++) {
        const shuffledInput = shuffle(fromTemplate(c.input));
        expect(fillWeeklyApiData<number>(shuffledInput, c.fillValue)).toEqual(expectedOutput);
      }
    });
  }
});
