import {
  dayjsToYearWeekString,
  dayjsToYearWeekWithDay,
  parseYearWeekString,
  yearWeekStringToDayjs,
  yearWeekWithDayToDayjs,
} from '../week';

describe('parseYearWeekString', () => {
  const goodCases: [string, number, number][] = [
    ['2020-07', 2020, 7],
    ['2020-7', 2020, 7],
    ['2020-15', 2020, 15],
    ['2020-01', 2020, 1],
    ['2020-52', 2020, 52],
    ['2020-53', 2020, 53],
  ];
  const badCases: string[] = [
    '2020-0',
    '2020-00',
    '2020-000',
    '2020-007',
    '07-2020',
    '15-2020',
    '20-07',
    '',
    '2020',
    '2020-54',
  ];

  for (const c of goodCases) {
    test(`parse "${c[0]}"`, () => {
      expect(parseYearWeekString(c[0])).toEqual({ year: c[1], week: c[2] });
    });
  }

  for (const c of badCases) {
    test(`parse "${c}" should fail`, () => {
      expect(() => parseYearWeekString(c)).toThrow();
    });
  }
});

describe('conversions between year-week strings and dayjs', () => {
  interface Case {
    label: string;
    firstDayInWeek: string;
    yearWeekStrings: string[];
  }
  const cases: Case[] = [
    {
      label: 'typical case',
      firstDayInWeek: '2021-03-29',
      yearWeekStrings: ['2021-13'],
    },
    {
      label: 'getting the 1st week of a year',
      firstDayInWeek: '2021-01-04',
      yearWeekStrings: ['2021-01', '2021-1'],
    },
    {
      label: "year of ISO week and year of start day don't match",
      firstDayInWeek: '2018-12-31',
      yearWeekStrings: ['2019-01', '2019-1'],
    },
    {
      label: 'getting the 53rd week of a year with 53 weeks',
      firstDayInWeek: '2020-12-28',
      yearWeekStrings: ['2020-53'],
    },
    {
      label: 'getting the 52nd week of a year with 52 weeks',
      firstDayInWeek: '2019-12-23',
      yearWeekStrings: ['2019-52'],
    },
  ];

  for (const c of cases) {
    // eslint-disable-next-line jest/valid-title
    test(c.label, () => {
      for (const yearWeekString of c.yearWeekStrings) {
        const resultDayjs = yearWeekWithDayToDayjs({
          yearWeek: yearWeekString,
          firstDayInWeek: c.firstDayInWeek,
        });
        expect(yearWeekStringToDayjs(yearWeekString).isSame(resultDayjs)).toBe(true);
        expect(resultDayjs.format('YYYY-MM-DD')).toEqual(c.firstDayInWeek);
        expect(c.yearWeekStrings).toContain(dayjsToYearWeekString(resultDayjs));
        expect(dayjsToYearWeekWithDay(resultDayjs).firstDayInWeek).toEqual(c.firstDayInWeek);
      }
    });
  }

  test('throws on bad input', () => {
    expect(() => yearWeekStringToDayjs('20-15')).toThrow();
    expect(() => yearWeekStringToDayjs('2017-53')).toThrow(); // 2017 has 52 ISO weeks
    expect(() => yearWeekStringToDayjs('2017-54')).toThrow(); // 2020 has 53 ISO weeks
    expect(() => yearWeekWithDayToDayjs({ yearWeek: '2021-13', firstDayInWeek: '2021-03-30' })).toThrow(); // firstDayInWeek is wrong
  });
});
