import dayjs from 'dayjs';
import { times, shuffle, random } from '../lodash_alternatives';

import { DateCacheClassForTests, UnifiedDay, UnifiedIsoWeek } from '../date-cache';

// UnifiedDay and UnifiedIsoWeek mutually recursively contain each other.
// Jest has a bug which makes it crash when recursive objects are used with toBe
// (https://github.com/facebook/jest/issues/10577), so we have to use
// `expect(a === b).toBe(true)` as a workaround.

type DateCache = InstanceType<typeof DateCacheClassForTests>;

describe('DateCache', () => {
  test('getDay', () => {
    const dateCache = new DateCacheClassForTests();
    const day = dateCache.getDay('2021-03-29');
    expect(day.string).toEqual('2021-03-29');
    expect(day.isoWeek.yearWeekString).toEqual('2021-13');
  });

  describe('getIsoWeek', () => {
    const goodCases: [string, string, number, number][] = [
      ['2020-07', '2020-07', 2020, 7],
      ['2020-7', '2020-07', 2020, 7],
      ['2020-15', '2020-15', 2020, 15],
      ['2020-01', '2020-01', 2020, 1],
      ['2020-52', '2020-52', 2020, 52],
      ['2020-53', '2020-53', 2020, 53],
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

      // 2017 has 52 ISO weeks
      '2017-53',
      '2017-54',
      '2017-55',

      // 2020 has 53 ISO weeks
      '2020-54',
      '2020-55',
    ];

    function testGoodCase(c: [string, string, number, number], dateCache: DateCache) {
      const week = dateCache.getIsoWeek(c[0]);
      expect(week.yearWeekString).toEqual(c[1]);
      expect(week.isoYear).toEqual(c[2]);
      expect(week.isoWeek).toEqual(c[3]);

      if (week.firstDay.isoWeek !== week) {
        console.log(week.yearWeekString, week.firstDay.isoWeek.yearWeekString);
      }
      expect(week.firstDay.isoWeek === week).toBe(true);
    }

    function testBadCase(c: string, dateCache: DateCache) {
      expect(() => dateCache.getIsoWeek(c)).toThrow();
    }

    for (const c of goodCases) {
      test(`parse "${c[0]}"`, () => {
        testGoodCase(c, new DateCacheClassForTests());
      });
    }

    for (const c of badCases) {
      test(`parse "${c}" should fail`, () => {
        testBadCase(c, new DateCacheClassForTests());
      });
    }

    test(`parses work in any order on the same DateCache instance`, () => {
      for (let i = 0; i < 10; i++) {
        const dateCache = new DateCacheClassForTests();
        let testers = [
          ...goodCases.map(c => () => testGoodCase(c, dateCache)),
          ...badCases.map(c => () => testBadCase(c, dateCache)),
        ];
        testers = testers.flatMap(tester => times(random(0, 3), () => tester));
        testers = shuffle(testers);

        for (const tester of testers) {
          tester();
        }
      }
    });
  });

  describe('relationships between days and weeks', () => {
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

    function testRelationships(
      firstDayInWeek: string,
      yearWeekString: string,
      dayFirst: boolean,
      dateCache: DateCache
    ) {
      let day: UnifiedDay;
      let week: UnifiedIsoWeek;
      if (dayFirst) {
        day = dateCache.getDay(firstDayInWeek);
        week = dateCache.getIsoWeek(yearWeekString);
      } else {
        week = dateCache.getIsoWeek(yearWeekString);
        day = dateCache.getDay(firstDayInWeek);
      }

      expect(day.isoWeek === week).toBe(true);
      expect(week.firstDay === day).toBe(true);
      expect(day.dayjs.isSame(dayjs(firstDayInWeek, 'YYYY-MM-DD'))).toBe(true);
      expect(dateCache.getDayUsingDayjs(day.dayjs) === day).toBe(true);
      expect(dateCache.getDayUsingDayjs(day.dayjs.add(1, 'day')).isoWeek === week).toBe(true);
      expect(dateCache.getDayUsingDayjs(day.dayjs.add(6, 'day')).isoWeek === week).toBe(true);
      expect(dateCache.getDayUsingDayjs(day.dayjs.add(7, 'day')).isoWeek !== week).toBe(true);
    }

    for (const c of cases) {
      // eslint-disable-next-line jest/valid-title
      test(c.label, () => {
        for (const yearWeekString of c.yearWeekStrings) {
          for (const dayFirst of [true, false]) {
            testRelationships(c.firstDayInWeek, yearWeekString, dayFirst, new DateCacheClassForTests());
          }
        }
      });
    }

    test(`relationship assertions work in any order on the same DateCache instance`, () => {
      for (let i = 0; i < 10; i++) {
        const dateCache = new DateCacheClassForTests();
        let testers = cases.flatMap(c =>
          c.yearWeekStrings.map(
            yearWeekString => () =>
              testRelationships(c.firstDayInWeek, yearWeekString, Math.random() > 0.5, dateCache)
          )
        );
        testers = testers.flatMap(tester => times(random(0, 3), () => tester));
        testers = shuffle(testers);

        for (const tester of testers) {
          tester();
        }
      }
    });
  });
});
