import React, { useEffect, useState, useCallback } from 'react';
import Metric, { MetricsWrapper, MetricsSpacing } from './Metrics';
import { BarChart, XAxis, YAxis, Bar, Cell, ResponsiveContainer, CartesianGrid } from 'recharts';
import {
  colors,
  Wrapper,
  TitleWrapper,
  ChartAndMetricsWrapper,
  ChartWrapper,
  CustomTimeTick,
} from './common';

const CHART_MARGIN_RIGHT = 30;
const CHART_MARGIN_BOTTOM = 10;

export type OnClickHandler = (index: number) => boolean;

export type TimeEntry = {
  firstDayInWeek: string;
  yearWeek: string;
  percent?: number;
  quantity: number;
};

export type TimeChartProps = {
  data: TimeEntry[];
  onClickHandler?: OnClickHandler;
};

export const TimeChart = React.memo(
  ({ data, onClickHandler }: TimeChartProps): JSX.Element => {
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
        <TitleWrapper id='graph_title'>
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
                margin={{ top: 6, right: CHART_MARGIN_RIGHT, left: 0, bottom: CHART_MARGIN_BOTTOM }}
                onMouseLeave={handleMouseLeave}
              >
                <XAxis
                  dataKey='yearWeek'
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  tick={
                    <CustomTimeTick
                      activeIndex={activeIndex}
                      dataLength={data.length}
                      currentValue={currentData.yearWeek}
                      unit='week'
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
              value={currentData.percent === undefined ? '-' : currentData.percent.toFixed(2)}
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
      <p>Chart not available</p>
    );
  }
);

export default TimeChart;
