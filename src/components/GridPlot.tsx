import { FullSampleAggEntry } from '../data/sample/FullSampleAggEntry';
import { globalDateCache, UnifiedDay } from '../helpers/date-cache';
import React, { useMemo, useState } from 'react';
import {
  ComposedChart,
  Label,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { colors } from '../widgets/common';

type TmpEntry = Pick<FullSampleAggEntry, 'date' | 'nextcladePangoLineage' | 'count'>;
type TmpEntry2 = {
  dateAsNumber: number;
  date: UnifiedDay;
  nextcladePangoLineage: string;
  count: number;
};
type Props = {
  data: TmpEntry[];
  width: number;
  height: number;
};

export const GridPlot = ({ data, width, height }: Props) => {
  const [active, setActive] = useState<number | undefined>(undefined);

  const { plotData, dataMap, dateRange, dateRangeAsNumbers, countRange } = useMemo(() => {
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
    topLevelMap.forEach((entries, nextcladePangoLineage) => {
      plotData.push({
        nextcladePangoLineage,
        entries: entries
          .map(e => ({
            nextcladePangoLineage: e.nextcladePangoLineage!,
            dateAsNumber: e.date!.dayjs.toDate().getTime(),
            date: e.date!,
            count: e.count,
          }))
          .sort((a, b) => a.dateAsNumber - b.dateAsNumber),
      });
    });

    const dataMap = new Map<string, Map<number, TmpEntry2>>();
    for (let { nextcladePangoLineage, entries } of plotData) {
      if (!dataMap.has(nextcladePangoLineage)) {
        dataMap.set(nextcladePangoLineage, new Map());
      }
      const dataMap2 = dataMap.get(nextcladePangoLineage)!;
      for (let e of entries) {
        dataMap2.set(e.dateAsNumber, e);
      }
    }

    return {
      plotData,
      dataMap,
      dateRange: [minDate, maxDate],
      dateRangeAsNumbers: [minDate, maxDate].map(d => d.dayjs.toDate().getTime()),
      countRange: [minCount, maxCount],
    };
  }, [data]);

  // Calculate the number of rows and columns and the size of the sub-plots
  const { plotWidth, numberCols, numberRows } = useMemo(() => {
    return calculateGridSizes(width - 100, height - 30, plotData.length);
  }, [width, height, plotData.length]);

  // Hello, CSS-Grid!
  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateRows: `repeat(${numberRows}, ${plotWidth + 20}px) 30px`,
          gridTemplateColumns: `50px repeat(${numberCols}, ${plotWidth}px)`,
        }}
      >
        {new Array(numberRows).fill(undefined).map((_, i) => (
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

        {new Array(numberCols).fill(undefined).map((_, i) => (
          <div
            style={{
              gridRowStart: Math.ceil(plotData.length / numberCols) + 1,
              gridColumnStart: i + 2,
            }}
            className='flex flex-row text-sm px-1'
          >
            <div>{dateRange[0].string}</div>
            <div className='flex-1'></div>
            <div>{dateRange[1].string}</div>
          </div>
        ))}

        {plotData.map((d, i) => (
          <div
            className='border-2 border-solid border-black m-1 flex flex-column'
            style={{
              gridRowStart: Math.floor(i / numberCols) + 1,
              gridColumnStart: (i % numberCols) + 2,
            }}
          >
            <div className='bg-gray-200 border-b-2 border-solid border-black pl-2'>
              {d.nextcladePangoLineage}
            </div>

            <div className='flex-1'>
              <ResponsiveContainer>
                <ComposedChart data={d.entries} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <XAxis dataKey='dateAsNumber' hide={true} type='number' domain={dateRangeAsNumbers} />
                  <YAxis domain={countRange} hide={true} />
                  <Tooltip
                    active={false}
                    cursor={false}
                    content={e => {
                      if (e.active && e.payload !== undefined) {
                        const newActive = e.payload[0].payload;
                        if (active === undefined || active !== newActive.dateAsNumber) {
                          setActive(newActive.dateAsNumber);
                        }
                      }
                      return <></>;
                    }}
                  />
                  {active && (
                    <ReferenceLine
                      x={active}
                      stroke='gray'
                      isFront={true}
                      label={
                        <Label position='right'>
                          {dataMap.get(d.nextcladePangoLineage)!.get(active)?.count}
                        </Label>
                      }
                    />
                  )}
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

const calculateGridSizes = (width: number, height: number, numberPlots: number) => {
  // TODO Use a proper optimization method rather than this very stupid way of brute-forcing
  const plotHeightPadding = 28;
  const plotWidthPadding = 10;
  let plotWidth = 0;
  let best = {
    plotWidth: 0,
    waste: width * height,
    numberCols: NaN,
    numberRows: NaN,
  };

  while (true) {
    plotWidth += 10;
    const waste =
      width * height - numberPlots * (plotWidth + plotWidthPadding) * (plotWidth + plotHeightPadding);
    const numberCols = Math.floor(width / (plotWidth + plotWidthPadding));
    const numberRows = Math.ceil(numberPlots / numberCols);
    if (
      waste < 0 ||
      (plotWidth + plotWidthPadding) * numberCols > width ||
      (plotWidth + plotHeightPadding) * numberRows > height
    ) {
      break;
    }
    if (waste < best.waste) {
      best = { plotWidth, waste, numberCols, numberRows };
    }
    if (waste === 0) {
      break;
    }
  }

  return {
    plotWidth: best.plotWidth,
    numberCols: best.numberCols,
    numberRows: best.numberRows,
  };
};
