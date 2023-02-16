import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import utc from 'dayjs/plugin/utc';
import minMax from 'dayjs/plugin/minMax';
import weekday from 'dayjs/plugin/weekday';
import calendar from 'dayjs/plugin/calendar';

export default function setupDayjs() {
  require('dayjs/locale/de');
  dayjs.locale('de');
  dayjs.extend(isoWeek);
  dayjs.extend(utc);
  dayjs.extend(minMax);
  dayjs.extend(weekday);
  dayjs.extend(calendar);
}
