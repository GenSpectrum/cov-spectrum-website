import { UnifiedDay } from '../../helpers/date-cache';
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
import { colors } from '../../widgets/common';
import { TmpEntry6 } from '../../pages/ManyPage';
import { GroupedData } from '../../data/transform/transform';

type TmpEntry2 = {
  dateAsNumber: number;
  date: UnifiedDay;
  nextcladePangoLineage: string;
  proportion: number;
};
type Props = {
  data: GroupedData<TmpEntry6, string>;
  width: number;
  height: number;
  setPangoLineage?: (pangoLineage: string) => void;
};

export const GridPlot = ({ data, width, height, setPangoLineage }: Props) => {
  const [active, setActive] = useState<number | undefined>(undefined);

  const { plotData, dataMap, dateRange, dateRangeAsNumbers, proportionRange } = useMemo(() => {
    const dataWithDateAsNumber = data.map(e => ({
      ...e,
      dateAsNumber: e.date.dayjs.toDate().getTime(),
    }));
    const dataAsArray = [...dataWithDateAsNumber.data];
    const oneArbitraryLineageData = dataAsArray[0][1].data;
    console.log(dataAsArray, oneArbitraryLineageData);
    const [minDate, maxDate] = [
      oneArbitraryLineageData[0].date,
      oneArbitraryLineageData[oneArbitraryLineageData.length - 1].date,
    ];

    const proportions = [...data.map(e => e.proportion).data].map(d => d[1].data).flat();
    let [minProportion, maxProportion] = [0, Math.max(...proportions)];

    const plotData: { nextcladePangoLineage: string; entries: TmpEntry2[] }[] = [];
    const dataMap = new Map<string, Map<number, TmpEntry2>>();
    for (const [lineage, d] of dataAsArray) {
      plotData.push({ nextcladePangoLineage: lineage, entries: d.data });
      if (!dataMap.has(lineage)) {
        dataMap.set(lineage, new Map());
      }
      const dataMap2 = dataMap.get(lineage)!;
      for (const e of d.data) {
        dataMap2.set(e.dateAsNumber, e);
      }
    }

    return {
      plotData,
      dataMap,
      dateRange: [minDate, maxDate],
      dateRangeAsNumbers: [minDate, maxDate].map(d => d.dayjs.toDate().getTime()),
      proportionRange: [minProportion, maxProportion],
    };
  }, [data]);

  // Calculate the number of rows and columns and the size of the sub-plots
  const { plotWidth, numberCols, numberRows } = useMemo(() => {
    return calculateGridSizes(width - 100, height - 30, plotData.length);
  }, [width, height, plotData.length]);

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
            <div>{proportionRange[1].toFixed(2)}</div>
            <div className='flex-1'></div>
            <div>{proportionRange[0]}</div>
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
            <div
              className='bg-gray-200 hover:bg-blue-500 border-b-2 border-solid border-black pl-2 cursor-pointer'
              onClick={() => setPangoLineage && setPangoLineage(d.nextcladePangoLineage)}
            >
              {d.nextcladePangoLineage}
            </div>

            <div className='flex-1'>
              <ResponsiveContainer>
                <ComposedChart data={d.entries} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <XAxis dataKey='dateAsNumber' hide={true} type='number' domain={dateRangeAsNumbers} />
                  <YAxis domain={proportionRange} hide={true} />
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
                        <Label position='left'>
                          {dataMap.get(d.nextcladePangoLineage)!.get(active)?.proportion.toFixed(4)}
                        </Label>
                      }
                    />
                  )}
                  <Line
                    type='monotone'
                    dataKey={'proportion'}
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
