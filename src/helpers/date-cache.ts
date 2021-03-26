import dayjs, { Dayjs } from 'dayjs';
import { dayjsToYearWeekString, parseYearWeekString, yearWeekStringToDayjs } from './week';

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

class DateCache {
  private dayCache = new Map<string, UnifiedDay>();
  private isoWeekCache = new Map<string, UnifiedIsoWeek>();

  getDay(dayString: string): UnifiedDay {
    return this._getDay(dayString, undefined, undefined);
  }

  getIsoWeek(yearWeekString: string): UnifiedIsoWeek {
    const cachedIsoWeek = this.isoWeekCache.get(yearWeekString);
    if (cachedIsoWeek) {
      return cachedIsoWeek;
    }

    const { year, week } = parseYearWeekString(yearWeekString);
    const firstDayDayjs = yearWeekStringToDayjs(yearWeekString);
    const firstDayString = firstDayDayjs.format('YYYY-MM-DD');

    const output: UnifiedIsoWeek = {
      isoYear: year,
      isoWeek: week,
      yearWeekString,
      firstDay: (undefined as any) as UnifiedDay,
    };
    output.firstDay = this._getDay(firstDayString, firstDayDayjs, output);
    this.isoWeekCache.set(yearWeekString, output);
    return output;
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

    const dayDayjs = _dayDayjs || dayjs(dayString, 'YYYY-MM-DD');
    const isoWeek = _isoWeek || this.getIsoWeek(dayjsToYearWeekString(dayDayjs));
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
