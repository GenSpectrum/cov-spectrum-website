import assert from 'assert';
import dayjs, { Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { yearWeekRegex, YearWeekWithDay } from '../services/api-types';

dayjs.extend(isoWeek);

// parseYearWeekString extracts the ISO week and year from a string.
// It will **not check** whether there is actually a week 53 in the specified year.
export function parseYearWeekString(yearWeek: string): { year: number; week: number } {
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

export function yearWeekStringToDayjs(yearWeek: string): Dayjs {
  const { year, week } = parseYearWeekString(yearWeek);
  // "The first week of the year, hence, always contains 4 January." https://en.wikipedia.org/wiki/ISO_week_date
  const output = dayjs().year(year).month(1).date(4).isoWeek(week).startOf('isoWeek');
  assert(output.isoWeek() === week && output.isoWeekYear() === year, 'conversion to dayjs was wrong');
  return output;
}

export function yearWeekWithDayToDayjs(input: YearWeekWithDay): Dayjs {
  const output = yearWeekStringToDayjs(input.yearWeek);
  assert.strictEqual(dayjsToYearWeekWithDay(output).firstDayInWeek, input.firstDayInWeek);
  return output;
}

export function dayjsToYearWeekString(yearWeek: Dayjs): string {
  return `${yearWeek.isoWeekYear()}-${yearWeek.isoWeek()}`;
}

export function dayjsToYearWeekWithDay(yearWeek: Dayjs): YearWeekWithDay {
  return {
    yearWeek: `${yearWeek.isoWeekYear()}-${yearWeek.isoWeek()}`,
    firstDayInWeek: yearWeek.startOf('isoWeek').format('YYYY-MM-DD'),
  };
}

export function addDayToYearWeek(yearWeek: string): YearWeekWithDay {
  return dayjsToYearWeekWithDay(yearWeekStringToDayjs(yearWeek));
}
