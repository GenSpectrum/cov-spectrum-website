import React, { useState, useEffect, useCallback } from 'react';
import { DistributionType, getVariantDistributionData } from '../services/api';
import { TimeDistributionEntry } from '../services/api-types';
import { SampleSelectorSchema } from '../helpers/sample-selector';
import { Widget } from './Widget';
import * as zod from 'zod';
import { ZodQueryEncoder } from '../helpers/query-encoder';
import ReactTooltip from 'react-tooltip';

import { BarChart, XAxis, YAxis, Bar, Cell, ResponsiveContainer, CartesianGrid } from 'recharts';
import styled from 'styled-components';

import { BiHelpCircle } from 'react-icons/bi';
import { fillWeeklyApiData } from '../helpers/fill-missing';
import { EntryWithoutCI, removeCIFromEntry } from '../helpers/confidence-interval';

const CHART_MARGIN_RIGHT = 15;
const METRIC_RIGHT_PADDING = '3rem';
const METRIC_WIDTH = '12rem';

const PropsSchema = SampleSelectorSchema;
type Props = zod.infer<typeof PropsSchema>;

export const colors = {
  active: '#2980b9',
  inactive: '#bdc3c7',
  active2: '#3498db',
  secondary: '#7f8c8d',
};

export const VariantTimeDistributionPlot = ({ country, mutations, matchPercentage }: Props) => {
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
  }, [country, mutations, matchPercentage]);

  const processedData: TimeEntry[] | undefined = distribution
    ? distribution.map(d => ({
        firstDayInWeek: d.x.firstDayInWeek,
        yearWeek: d.x.yearWeek,
        percent: d.y.proportion * 100,
        quantity: d.y.count,
      }))
    : undefined;

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
const MetricWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
  padding-right: ${METRIC_RIGHT_PADDING};
  width: ${METRIC_WIDTH};
  flex: 1;
  flex-grow: 0;
`;
const Spacing = styled.div`
  display: flex;
  flex-grow: 1;
`;
const ValueWrapper = styled.div`
  font-size: 3rem;
  width: auto;
  flex-grow: 0;
  line-height: 1;
  color: ${props => props.color ?? colors.inactive};
`;

const MetricTitleWrapper = styled.div`
  font-size: 1rem;
  display: flex;
  color: ${colors.inactive};
  height: 1.6rem;
`;
const MetricsWrapper = styled.div`
  padding: 1.5rem 0 1.4rem 0rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;
const ChartWrapper = styled.div`
  flex-grow: 1;
  width: 10rem;
`;
const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  padding-left: 0.2rem;
  flex-grow: 1;
`;

type MetricProps = {
  value: number | string;
  title: string;
  color?: string;
  helpText: string;
  percent?: string | number | boolean;
};

export const Metric = ({ percent = false, value, title, color, helpText }: MetricProps): JSX.Element => {
  const tooltipId = 'TEST-id' + title;
  return (
    <MetricWrapper id='metric-with-tooltip'>
      <div data-for={tooltipId} data-tip={helpText}>
        <ValueWrapper color={color}>
          {value}
          {percent && '%'}
        </ValueWrapper>
        <MetricTitleWrapper id='metric-title'>
          {title + ' '}
          <IconWrapper id='info-wrapper'>
            <BiHelpCircle />
          </IconWrapper>
        </MetricTitleWrapper>
      </div>
      <ReactTooltip id={tooltipId} />
    </MetricWrapper>
  );
};

type CustomTickProps = {
  x?: number;
  y?: number;
  stroke?: unknown;
  payload?: { value: string };
  activeIndex: number;
  dataLength: number;
  currentValue: string;
};

const getTickText = (value: string, dataLength: number, isActive: boolean) => {
  if (dataLength > 10) {
    return value.slice(5);
  } else if (dataLength > 5) {
    return value.slice(2);
  } else {
    return value;
  }
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
          {getTickText(payload.value, dataLength, payload.value === currentValue)}
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
        <TitleWrapper>
          Proportion of the variant on week {currentData.yearWeek.split('-')[1]}
          {', '}
          {currentData.yearWeek.split('-')[0] + ' '}({currentData.firstDayInWeek})
        </TitleWrapper>
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
                  allowDecimals={true}
                  hide={false}
                  domain={[0, (dataMax: number) => Math.ceil(dataMax)]}
                />
                <CartesianGrid vertical={false} />
                {bars}
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>
          <MetricsWrapper>
            <Spacing />
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
              helpText='Number of samples collected in this time frame.'
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
