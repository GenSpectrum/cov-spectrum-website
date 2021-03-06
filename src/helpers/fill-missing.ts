import assert from 'assert';
import dayjs, { Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { last, sortBy } from 'lodash';
import { YearWeekWithDay } from '../services/api-types';
import { dayjsToYearWeekWithDay, yearWeekWithDayToDayjs } from './week';

dayjs.extend(isoWeek);

type RangeFillerOutput<T> = { useOriginal: true } | { useOriginal: false; fill: T } | undefined;

interface RangeFiller<T> {
  next(nextOriginal: T | undefined): RangeFillerOutput<T>;
}

function fillMissingData<X, Y, FK>(
  unsortedOriginalData: { x: X; y: Y }[],
  Filler: { new (min: FK, max: FK): RangeFiller<FK> },
  getFillerKey: (x: X) => FK,
  getSortKey: (fillerKey: FK) => unknown,
  makeFillerElement: (fillerKey: FK) => { x: X; y: Y }
): { x: X; y: Y }[] {
  if (!unsortedOriginalData.length) {
    return [];
  }

  const sortedOriginalData = sortBy(unsortedOriginalData, ({ x }) => getSortKey(getFillerKey(x)));
  const filler = new Filler(getFillerKey(sortedOriginalData[0].x), getFillerKey(last(sortedOriginalData)!.x));

  const output = [];
  for (const original of sortedOriginalData) {
    while (true) {
      const next = filler.next(getFillerKey(original.x));
      if (!next) {
        throw new Error('filler stopped providing data while in original range');
      }
      if (next.useOriginal) {
        output.push(original);
        break;
      } else {
        output.push(makeFillerElement(next.fill));
      }
    }
  }
  while (true) {
    const next = filler.next(undefined);
    if (!next) {
      break;
    }
    if (next.useOriginal) {
      throw new Error('filler.next() returned useOriginal although no original value was passed');
    }
    output.push(makeFillerElement(next.fill));
  }
  return output;
}

class IsoWeekFiller implements RangeFiller<Dayjs> {
  private current: Dayjs;

  constructor(private min: Dayjs, private max: Dayjs) {
    assert(min.startOf('isoWeek').isSame(min));
    assert(max.startOf('isoWeek').isSame(max));
    assert(min.isBefore(max) || min.isSame(max));
    this.current = min;
  }

  next(nextOriginal: Dayjs | undefined): RangeFillerOutput<Dayjs> {
    assert(!nextOriginal || nextOriginal.startOf('isoWeek').isSame(nextOriginal));
    let output: RangeFillerOutput<Dayjs>;
    let advanceCurrent = false;

    if (this.current.isAfter(this.max)) {
      return undefined;
    } else if (nextOriginal && (nextOriginal.isBefore(this.current) || nextOriginal.isSame(this.current))) {
      advanceCurrent = nextOriginal.isSame(this.current);
      output = { useOriginal: true };
    } else {
      output = { useOriginal: false, fill: this.current };
      advanceCurrent = true;
    }

    if (advanceCurrent) {
      const next = this.current.endOf('isoWeek').add(1, 'day');
      assert(next.isoWeek() !== this.current.isoWeek());
      this.current = next;
    }

    return output;
  }
}

export function fillWeeklyApiData<Y>(
  unsortedOriginalData: { x: YearWeekWithDay; y: Y }[],
  fillerY: Y
): { x: YearWeekWithDay; y: Y }[] {
  return fillMissingData(
    unsortedOriginalData,
    IsoWeekFiller,
    yearWeekWithDayToDayjs,
    v => [v.isoWeekYear(), v.isoWeek()],
    v => ({ x: dayjsToYearWeekWithDay(v), y: fillerY })
  );
}
