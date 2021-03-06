import dayjs, { Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { last, sortBy } from 'lodash';
import { YearWeekWithDay } from '../services/api-types';
import { dayjsToYearWeekWithDay, yearWeekWithDayToDayjs } from './week';

dayjs.extend(isoWeek);

interface RangeFiller<T> {
  next(nextOriginal: T | undefined): { useOriginal: true } | { useOriginal: false; fill: T } | undefined;
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
  constructor(private min: Dayjs, private max: Dayjs) {}

  next(
    nextOriginal: Dayjs | undefined
  ): { useOriginal: true } | { useOriginal: false; fill: Dayjs } | undefined {
    throw new Error('not implemented');
  }
}

export function fillApiWeeklyData<Y>(
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
