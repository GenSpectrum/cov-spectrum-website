import { UnifiedDay } from '../../helpers/date-cache';
import React, { useMemo, useState } from 'react';
import { ComposedChart, Label, Line, ReferenceLine, Tooltip, XAxis, YAxis } from 'recharts';
import { colors } from '../../widgets/common';
import { GroupedData } from '../../data/transform/transform';
import { EntryDateCountWithProportions } from './SequencesOverTimeGrid';
import { HtmlPortalNode, InPortal } from 'react-reverse-portal';
import { AxisPortals, TwoValuesXAxis, TwoValuesYAxis } from './common';
import { TooltipSideEffect } from '../RechartsTooltip';

type PlotEntry = {
  dateAsNumber: number;
  date: UnifiedDay;
  nextcladePangoLineage: string;
  proportion: number;
};
type Props = {
  data: GroupedData<EntryDateCountWithProportions, string>;
  portals: Map<string, HtmlPortalNode>;
  axisPortals: AxisPortals;
  plotWidth: number;
};

export const SequencesOverTimeGridInner = ({ data, portals, axisPortals, plotWidth }: Props) => {
  const [active, setActive] = useState<number | undefined>(undefined);

  const { plotData, dataMap, dateRange, dateRangeAsNumbers, proportionRange } = useMemo(() => {
    const dataWithDateAsNumber = data.map(e => ({
      ...e,
      dateAsNumber: e.date.dayjs.toDate().getTime(),
    }));
    const dataAsArray = [...dataWithDateAsNumber.data];
    const oneArbitraryLineageData = dataAsArray[0][1].data;
    const [minDate, maxDate] = [
      oneArbitraryLineageData[0].date,
      oneArbitraryLineageData[oneArbitraryLineageData.length - 1].date,
    ];

    const proportions = [...data.map(e => e.proportion).data].map(d => d[1].data).flat();
    let [minProportion, maxProportion] = [0, Math.max(...proportions)];

    const plotData: { nextcladePangoLineage: string; entries: PlotEntry[] }[] = [];
    const dataMap = new Map<string, Map<number, PlotEntry>>();
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

  return (
    <>
      {/*<GridXAxis>*/}
      {axisPortals.x.map((portal, i) => (
        <InPortal node={portal} key={i}>
          <TwoValuesXAxis low={dateRange[0].string} high={dateRange[1].string} size={plotWidth} />
        </InPortal>
      ))}
      {axisPortals.y.map((portal, i) => (
        <InPortal node={portal} key={i}>
          <TwoValuesYAxis
            low={proportionRange[0].toFixed(2)}
            high={proportionRange[1].toFixed(2)}
            size={plotWidth}
          />
        </InPortal>
      ))}
      {plotData.map(
        d =>
          portals.get(d.nextcladePangoLineage) && (
            <InPortal key={d.nextcladePangoLineage} node={portals.get(d.nextcladePangoLineage)!}>
              <ComposedChart
                data={d.entries}
                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                width={plotWidth}
                height={plotWidth}
                onMouseLeave={() => setActive(undefined)}
              >
                <XAxis dataKey='dateAsNumber' hide={true} type='number' domain={dateRangeAsNumbers} />
                <YAxis domain={proportionRange} hide={true} />
                <Tooltip
                  active={false}
                  cursor={false}
                  content={tooltipProps => {
                    return (
                      <TooltipSideEffect
                        tooltipProps={tooltipProps}
                        sideEffect={tooltipProps => {
                          if (tooltipProps.active && tooltipProps.payload !== undefined) {
                            const newActive = tooltipProps.payload[0].payload;
                            if (active === undefined || active !== newActive.dateAsNumber) {
                              setActive(newActive.dateAsNumber);
                            }
                          }
                        }}
                      />
                    );
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
            </InPortal>
          )
      )}
    </>
  );
};
