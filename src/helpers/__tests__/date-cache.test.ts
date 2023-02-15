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
    const dateCache = new DateCacheClassForTests();
    test.each([
      { nonNormalizedYearWeekString: '2020-07', yearWeekString: '2020-07', isoYear: 2020, isoWeek: 7 },
      { nonNormalizedYearWeekString: '2020-7', yearWeekString: '2020-07', isoYear: 2020, isoWeek: 7 },
      { nonNormalizedYearWeekString: '2020-15', yearWeekString: '2020-15', isoYear: 2020, isoWeek: 15 },
      { nonNormalizedYearWeekString: '2020-01', yearWeekString: '2020-01', isoYear: 2020, isoWeek: 1 },
      { nonNormalizedYearWeekString: '2020-52', yearWeekString: '2020-52', isoYear: 2020, isoWeek: 52 },
      { nonNormalizedYearWeekString: '2020-53', yearWeekString: '2020-53', isoYear: 2020, isoWeek: 53 },
    ])(
      'should calculate yearWeekString: $yearWeekString , isoYear: $isoYear , isoWeek: $isoWeek from input $nonNormalizedYearWeekString',
      ({ nonNormalizedYearWeekString, yearWeekString, isoYear, isoWeek }) => {
        const week = dateCache.getIsoWeek(nonNormalizedYearWeekString);
        expect(week.yearWeekString).toEqual(yearWeekString);
        expect(week.isoYear).toEqual(isoYear);
        expect(week.isoWeek).toEqual(isoWeek);
        expect(week.firstDay.isoWeek === week).toBe(true);
      }
    );

    test.each([
      { nonNormalizedYearWeekString: '2020-0' },
      { nonNormalizedYearWeekString: '2020-00' },
      { nonNormalizedYearWeekString: '2020-000' },
      { nonNormalizedYearWeekString: '2020-007' },
      { nonNormalizedYearWeekString: '07-2020' },
      { nonNormalizedYearWeekString: '15-2020' },
      { nonNormalizedYearWeekString: '20-07' },
      { nonNormalizedYearWeekString: '' },
      { nonNormalizedYearWeekString: '2020' },
      { nonNormalizedYearWeekString: '2020-54' },

      // 2017 has 52 ISO weeks
      { nonNormalizedYearWeekString: '2017-53' },
      { nonNormalizedYearWeekString: '2017-54' },
      { nonNormalizedYearWeekString: '2017-55' },

      // 2020 has 53 ISO weeks
      { nonNormalizedYearWeekString: '2020-54' },
      { nonNormalizedYearWeekString: '2020-55' },
    ])(
      'should throw error for wrong input $nonNormalizedYearWeekString',
      ({ nonNormalizedYearWeekString }) => {
        expect(() => dateCache.getIsoWeek(nonNormalizedYearWeekString)).toThrow();
      }
    );
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
