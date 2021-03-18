import React, { useState, useEffect, useCallback } from 'react';
import { DistributionType, getVariantDistributionData } from '../services/api';
import { TimeDistributionEntry } from '../services/api-types';
import { SampleSelectorSchema } from '../helpers/sample-selector';
import { Widget } from './Widget';
import * as zod from 'zod';
import { ZodQueryEncoder } from '../helpers/query-encoder';

import { BarChart, XAxis, YAxis, Bar, Cell, ResponsiveContainer, CartesianGrid } from 'recharts';
import styled from 'styled-components';

import { fillWeeklyApiData } from '../helpers/fill-missing';
import { EntryWithoutCI, removeCIFromEntry } from '../helpers/confidence-interval';
import Metric, { MetricsWrapper, MetricsSpacing } from '../charts/Metrics';

const CHART_MARGIN_RIGHT = 15;

const PropsSchema = SampleSelectorSchema;
type Props = zod.infer<typeof PropsSchema>;

export const colors = {
  active: '#3a6e6f',
  inactive: '#a1b3ba',
  active2: '#3498db',
  secondary: '#7f8c8d',
};

export const VariantTimeDistributionPlot = ({
  country,
  mutations,
  matchPercentage,
  samplingStrategy,
}: Props) => {
  const [distribution, setDistribution] = useState<EntryWithoutCI<TimeDistributionEntry>[] | undefined>(
    undefined
  );

  useEffect(() => {
    let isSubscribed = true;
    const controller = new AbortController();
    const signal = controller.signal;
    getVariantDistributionData(
      {
        distributionType: DistributionType.Time,
        country,
        mutations,
        matchPercentage,
        samplingStrategy,
      },
      signal
    ).then(newDistributionData => {
      if (isSubscribed) {
        setDistribution(
          fillWeeklyApiData(newDistributionData.map(removeCIFromEntry), { count: 0, proportion: 0 })
        );
      }
    });
    return () => {
      isSubscribed = false;
      controller.abort();
    };
  }, [country, mutations, matchPercentage, samplingStrategy]);

  const processedData: TimeEntry[] | undefined = distribution?.map(d => ({
    firstDayInWeek: d.x.firstDayInWeek,
    yearWeek: d.x.yearWeek,
    percent: d.y.proportion * 100,
    quantity: d.y.count,
  }));

  return processedData === undefined ? (
    <p>Loading</p>
  ) : (
    <TimeGraph data={processedData} onClickHandler={(e: unknown) => true} />
  );
};

//type for when a graph element is clicked
export type OnClickHandler = (index: number) => boolean;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;
const TitleWrapper = styled.div`
  padding: 0.5rem 0rem 1rem 0rem;
  font-size: 1.2rem;
  line-height: 1.3;
  color: ${colors.secondary};
`;
const ChartAndMetricsWrapper = styled.div`
  display: flex;
  flex: 1;
`;

const ChartWrapper = styled.div`
  flex-grow: 1;
  width: 10rem;
`;

const getTickText = (value: string, dataLength: number, activeIndex: number, index: number) => {
  if (dataLength > 20) {
    if (activeIndex === index) {
      return value.slice(5);
    } else if (Math.abs(activeIndex - index) <= 1) {
      return '';
    } else if (index % 2 === 0) {
      return value.slice(5);
    }
  } else if (dataLength > 10) {
    return value.slice(5);
  } else if (dataLength > 5) {
    return value.slice(2);
  } else {
    return value;
  }
};

type CustomTickProps = {
  x?: number;
  y?: number;
  stroke?: unknown;
  payload?: { value: string; index: number };
  activeIndex: number;
  dataLength: number;
  currentValue: string;
};

const CustomTick = ({
  x,
  y,
  payload,
  activeIndex,
  dataLength,
  currentValue,
}: CustomTickProps): JSX.Element => {
  return (
    <g transform={`translate(${x},${y})`}>
      {payload ? (
        <text
          x={0}
          y={0}
          dx={0}
          dy={10}
          textAnchor='middle'
          fill={payload.value === currentValue ? colors.active : colors.inactive}
        >
          {getTickText(payload.value, dataLength, activeIndex, payload.index)}
        </text>
      ) : (
        <></>
      )}
    </g>
  );
};

export type TimeEntry = {
  firstDayInWeek: string;
  yearWeek: string;
  percent: number;
  quantity: number;
};

export type TimeGraphProps = {
  data: TimeEntry[];
  onClickHandler?: OnClickHandler;
};

export const TimeGraph = React.memo(
  ({ data, onClickHandler }: TimeGraphProps): JSX.Element => {
    const [activeIndex, setActiveIndex] = useState<number>(data.length - 1);
    const [ready, setReady] = useState(false);
    const [currentData, setCurrentData] = useState<TimeEntry>(data[data.length - 1]);

    useEffect(() => {
      setReady(true);
    }, []);

    const resetDefault = useCallback(() => {
      setCurrentData(data[data.length - 1]);
      setActiveIndex(data.length - 1);
    }, [data]);

    useEffect(() => {
      resetDefault();
    }, [data, resetDefault]);

    const handleMouseEnter = (context: unknown, index: number): void => {
      setCurrentData(data[index]);
      setActiveIndex(index);
    };

    const handleClick = (context: unknown, index: number): void => {
      if (onClickHandler) {
        onClickHandler(index);
      }
    };

    const handleMouseLeave = (): void => {
      resetDefault();
    };

    const bars = [
      <Bar
        dataKey='percent'
        key='percent'
        stackId='a'
        onMouseEnter={handleMouseEnter}
        onClick={handleClick}
        isAnimationActive={false}
      >
        {data.map((entry: unknown, index: number) => (
          <Cell
            cursor={onClickHandler && 'pointer'}
            fill={index === activeIndex ? colors.active : colors.inactive}
            key={`cell-${index}`}
          ></Cell>
        ))}
      </Bar>,
    ];

    return ready && currentData ? (
      <Wrapper>
        <ChartAndMetricsWrapper>
          <ChartWrapper>
            <ResponsiveContainer>
              <BarChart
                data={data}
                barCategoryGap='5%'
                margin={{ top: 6, right: CHART_MARGIN_RIGHT, left: 0, bottom: 0 }}
                onMouseLeave={handleMouseLeave}
              >
                <XAxis
                  dataKey='yearWeek'
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  tick={
                    <CustomTick
                      activeIndex={activeIndex}
                      dataLength={data.length}
                      currentValue={currentData.yearWeek}
                    />
                  }
                />
                <YAxis
                  dataKey='percent'
                  interval={1}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={tick => `${tick}%`}
                  allowDecimals={true}
                  hide={false}
                  width={50}
                  domain={[0, (dataMax: number) => Math.ceil(dataMax)]}
                />
                <CartesianGrid vertical={false} />
                {bars}
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>
          <MetricsWrapper>
            <MetricsSpacing />
            <Metric
              value={currentData.percent.toFixed(2)}
              title='Proportion'
              color={colors.active}
              helpText='Estimated proportion relative to all samples collected.'
              percent={true}
            />
            <Metric
              value={currentData.quantity}
              title='Samples'
              color={colors.secondary}
              helpText='Number of samples of the variant collected in this time frame.'
            />
          </MetricsWrapper>
        </ChartAndMetricsWrapper>
      </Wrapper>
    ) : (
      <></>
    );
  }
);

export const VariantTimeDistributionPlotWidget = new Widget(
  new ZodQueryEncoder(PropsSchema),
  VariantTimeDistributionPlot,
  'VariantTimeDistributionPlot'
);
