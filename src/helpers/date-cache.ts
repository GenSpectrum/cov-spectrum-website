import assert from 'assert';
import dayjs, { Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import utc from 'dayjs/plugin/utc';
import minMax from 'dayjs/plugin/minMax';
import weekday from 'dayjs/plugin/weekday';
import calendar from 'dayjs/plugin/calendar';

require('dayjs/locale/de');
dayjs.locale('de');
dayjs.extend(isoWeek);
dayjs.extend(utc);
dayjs.extend(minMax);
dayjs.extend(weekday);
dayjs.extend(calendar);

export interface UnifiedDay {
  string: string;
  dayjs: Dayjs;
  isoWeek: UnifiedIsoWeek;
}

export interface UnifiedIsoWeek {
  isoYear: number;
  isoWeek: number;
  yearWeekString: string;
  firstDay: UnifiedDay;
}

// parseYearWeekString extracts the ISO week and year from a string.
// It will **not check** whether there is actually a week 53 in the specified year.
function parseYearWeekString(yearWeek: string): { year: number; week: number } {
  const yearWeekRegex = /^(\d{4})-(\d{1,2})$/;
  const m = yearWeek.match(yearWeekRegex);
  if (!m) {
    throw new Error('invalid YearWeek string');
  }
  const parsed = { year: +m[1], week: +m[2] };
  if (!(parsed.week >= 1 && parsed.week <= 53)) {
    throw new Error('invalid week in YearWeek string');
  }
  return parsed;
}

function yearWeekStringToDayjs(yearWeek: string): Dayjs {
  const { year, week } = parseYearWeekString(yearWeek);
  // "The first week of the year, hence, always contains 4 January." https://en.wikipedia.org/wiki/ISO_week_date
  const output = dayjs().year(year).month(1).date(4).isoWeek(week).startOf('isoWeek');
  assert(output.isoWeek() === week && output.isoWeekYear() === year, 'conversion to dayjs was wrong');
  return output;
}

function dayjsToYearWeekString(yearWeek: Dayjs): string {
  return `${yearWeek.isoWeekYear()}-${yearWeek.isoWeek().toString().padStart(2, '0')}`;
}

class DateCache {
  private dayCache = new Map<string, UnifiedDay>();
  private isoWeekCache = new Map<string, UnifiedIsoWeek>();
  private nextWeekCache = new WeakMap<UnifiedIsoWeek, UnifiedIsoWeek>();

  getDay(dayString: string): UnifiedDay {
    return this._getDay(dayString, undefined, undefined);
  }

  getDayUsingDayjs(dayjsDay: Dayjs): UnifiedDay {
    return this.getDay(dayjsDay.format('YYYY-MM-DD'));
  }

  today(): UnifiedDay {
    return this.getDayUsingDayjs(dayjs());
  }

  getIsoWeek(nonNormalizedYearWeekString: string): UnifiedIsoWeek {
    let yearWeekString =
      nonNormalizedYearWeekString.length === 7
        ? nonNormalizedYearWeekString
        : nonNormalizedYearWeekString.slice(0, 5) + '0' + nonNormalizedYearWeekString.slice(5);

    const cachedIsoWeek = this.isoWeekCache.get(yearWeekString);
    if (cachedIsoWeek) {
      return cachedIsoWeek;
    }

    assert(!!yearWeekString.match(/^\d{4}-\d{2}$/));

    const { year, week } = parseYearWeekString(yearWeekString);
    const firstDayDayjs = yearWeekStringToDayjs(yearWeekString);
    const firstDayString = firstDayDayjs.format('YYYY-MM-DD');

    const output: UnifiedIsoWeek = {
      isoYear: year,
      isoWeek: week,
      yearWeekString,
      firstDay: undefined as any as UnifiedDay,
    };
    output.firstDay = this._getDay(firstDayString, firstDayDayjs, output);
    assert(output.firstDay.isoWeek === output);
    this.isoWeekCache.set(yearWeekString, output);
    return output;
  }

  rangeFromDays(days: Iterable<UnifiedDay>): { min: UnifiedDay; max: UnifiedDay } | undefined {
    let min: UnifiedDay | undefined;
    let max: UnifiedDay | undefined;
    for (const day of days) {
      if (!min) {
        min = day;
      } else if (day.dayjs.isBefore(min.dayjs)) {
        min = day;
      }
      if (!max) {
        max = day;
      } else if (day.dayjs.isAfter(max.dayjs)) {
        max = day;
      }
    }
    assert.strictEqual(min === undefined, max === undefined);
    return min && max && { min, max };
  }

  daysFromRange(range: { min: UnifiedDay; max: UnifiedDay } | undefined): UnifiedDay[] {
    if (!range) {
      return [];
    }
    const { min, max } = range;
    assert(min.dayjs.isBefore(max.dayjs) || min === max);
    const diff = max.dayjs.diff(min.dayjs, 'day');
    const output: UnifiedDay[] = [min];
    for (let i = 0; i < diff; i++) {
      output.push(this.getDayUsingDayjs(min.dayjs.add(i, 'day')));
    }
    return output;
  }

  middleDay({ min, max }: { min: UnifiedDay; max: UnifiedDay }): UnifiedDay {
    const diff = Math.abs(min.dayjs.diff(max.dayjs, 'days'));
    const middle = min.dayjs.add(Math.floor(diff / 2), 'days');
    return this.getDayUsingDayjs(middle);
  }

  rangeFromWeeks(weeks: Iterable<UnifiedIsoWeek>): { min: UnifiedIsoWeek; max: UnifiedIsoWeek } | undefined {
    let min: UnifiedIsoWeek | undefined;
    let max: UnifiedIsoWeek | undefined;
    for (const week of weeks) {
      if (!min) {
        min = week;
      } else if (this.weekIsBefore(week, min)) {
        min = week;
      }
      if (!max) {
        max = week;
      } else if (this.weekIsBefore(max, week)) {
        max = week;
      }
    }
    assert.strictEqual(min === undefined, max === undefined);
    return min && max && { min, max };
  }

  weeksFromRange(range: { min: UnifiedIsoWeek; max: UnifiedIsoWeek } | undefined): UnifiedIsoWeek[] {
    if (!range) {
      return [];
    }

    const { min, max } = range;
    assert(this.weekIsBefore(min, max) || min === max);

    const maxOutputSize = (max.isoYear - min.isoYear + 1) * 53;
    assert(maxOutputSize > 0);

    const output: UnifiedIsoWeek[] = [min];
    let last = min;
    while (last !== max) {
      const next = this.getNextWeek(last);
      last = next;

      output.push(next);
      assert(output.length <= maxOutputSize);
    }
    return output;
  }

  // a < b
  weekIsBefore(a: UnifiedIsoWeek, b: UnifiedIsoWeek) {
    return a.isoYear < b.isoYear || (a.isoYear === b.isoYear && a.isoWeek < b.isoWeek);
  }

  private getNextWeek(week: UnifiedIsoWeek): UnifiedIsoWeek {
    let nextWeek = this.nextWeekCache.get(week);
    if (nextWeek) {
      return nextWeek;
    }

    // this is good enough for most weeks of the year
    nextWeek = this.isoWeekCache.get(`${week.isoYear}-${week.isoWeek + 1}`);

    // cover the case where "week.isoWeek + 1" is out of range at the end of the year
    if (!nextWeek) {
      const firstDayOfNextWeek = week.firstDay.dayjs.endOf('isoWeek').add(1, 'day').startOf('isoWeek');
      nextWeek = this.getDayUsingDayjs(firstDayOfNextWeek).isoWeek;
    }

    assert(this.weekIsBefore(week, nextWeek));
    this.nextWeekCache.set(week, nextWeek);
    return nextWeek;
  }

  private _getDay(
    dayString: string,
    _dayDayjs: Dayjs | undefined,
    _isoWeek: UnifiedIsoWeek | undefined
  ): UnifiedDay {
    const cachedDay = this.dayCache.get(dayString);
    if (cachedDay) {
      return cachedDay;
    }

    assert(!!dayString.match(/^\d{4}-\d{2}-\d{2}$/));

    const dayDayjs = _dayDayjs || dayjs(dayString, 'YYYY-MM-DD');
    const isoWeek = _isoWeek || this.getIsoWeek(dayjsToYearWeekString(dayDayjs));

    // Since getDay and getIsoWeek are mutually recursive, we may already have created
    // the requested day. If that is the case, return that instance to prevent duplicates.
    if (isoWeek.firstDay?.string === dayString) {
      return isoWeek.firstDay;
    }

    const output: UnifiedDay = {
      string: dayString,
      dayjs: dayDayjs,
      isoWeek,
    };
    this.dayCache.set(dayString, output);
    return output;
  }
}

// It is important that there is only one DateCache instance, so that all UnifiedDay (etc.)
// objects are reference equal when they describe the same day
export const globalDateCache = new DateCache();

export const DateCacheClassForTests = DateCache;
