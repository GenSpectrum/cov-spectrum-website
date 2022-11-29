import { FullSampleAggEntry } from '../data/sample/FullSampleAggEntry';
import { globalDateCache } from '../helpers/date-cache';
import React, { useMemo } from 'react';
import { ComposedChart, Line, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { colors } from '../widgets/common';

type TmpEntry = Pick<FullSampleAggEntry, 'date' | 'nextcladePangoLineage' | 'count'>;
type TmpEntry2 = {
  date: Date;
  nextcladePangoLineage: string;
  count: number;
};
type Props = {
  data: TmpEntry[];
  plotWidth: number;
  plotHeight: number;
  numberColumns: number;
};

export const GridPlot = ({ data }: Props) => {
  const { plotData, dateRange, countRange } = useMemo(() => {
    let [minDate, maxDate] = [globalDateCache.getDay('2099-12-31'), globalDateCache.getDay('1900-01-01')];
    let [minCount, maxCount] = [Infinity, -Infinity];
    const topLevelMap = new Map<string, TmpEntry[]>();
    for (let d of data) {
      const { nextcladePangoLineage, date, count } = d;
      if (date!.dayjs.isBefore(minDate.dayjs)) {
        minDate = date!;
      }
      if (date!.dayjs.isAfter(maxDate.dayjs)) {
        maxDate = date!;
      }
      if (count < minCount) {
        minCount = count;
      }
      if (count > maxCount) {
        maxCount = count;
      }
      if (!topLevelMap.has(nextcladePangoLineage!)) {
        topLevelMap.set(nextcladePangoLineage!, []);
      }
      topLevelMap.get(nextcladePangoLineage!)!.push(d);
    }
    const plotData: { nextcladePangoLineage: string; entries: TmpEntry2[] }[] = [];
    topLevelMap.forEach((entries, nextcladePangoLineage) =>
      plotData.push({
        nextcladePangoLineage,
        entries: entries.map(e => ({
          nextcladePangoLineage: e.nextcladePangoLineage!,
          date: e.date!.dayjs.toDate(),
          count: e.count,
        })),
      })
    );
    console.log(plotData);

    return {
      plotData,
      dateRange: [minDate.dayjs.toDate(), maxDate.dayjs.toDate()],
      countRange: [minCount, maxCount],
    };
  }, [data]);

  // Hello, CSS-Grid!
  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateRows: `repeat(2, 220px) 30px`,
          gridTemplateColumns: `50px repeat(5, 200px)`,
        }}
      >
        {new Array(2).fill(undefined).map((_, i) => (
          <div
            style={{
              gridRowStart: i + 1,
              gridColumnStart: 1,
              paddingTop: 28,
            }}
            className='flex flex-column text-right text-sm'
          >
            <div>{countRange[1]}</div>
            <div className='flex-1'></div>
            <div>{countRange[0]}</div>
          </div>
        ))}

        {new Array(5).fill(undefined).map((_, i) => (
          <div
            style={{
              gridRowStart: Math.ceil(plotData.length / 5) + 1,
              gridColumnStart: i + 2,
            }}
            className='flex flex-row text-sm px-1'
          >
            <div>{dateRange[0].toISOString().substring(0, 10)}</div>
            <div className='flex-1'></div>
            <div>{dateRange[1].toISOString().substring(0, 10)}</div>
          </div>
        ))}

        {plotData.map((d, i) => (
          <div
            className='border-2 border-solid border-black m-1 flex flex-column'
            style={{
              gridRowStart: Math.floor(i / 5) + 1,
              gridColumnStart: (i % 5) + 2,
            }}
          >
            <div className='bg-gray-200 border-b-2 border-solid border-black pl-2'>
              {d.nextcladePangoLineage}
            </div>

            <div className='flex-1'>
              <ResponsiveContainer>
                <ComposedChart data={d.entries} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <XAxis dataKey='date' hide={true} />
                  <YAxis domain={countRange} hide={true} />
                  <Line
                    type='monotone'
                    dataKey={'count'}
                    stroke={colors.active}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
