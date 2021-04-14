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

const CHART_MARGIN_RIGHT = 15;

export type OnClickHandler = (index: number) => boolean;

export type TimeIntensityEntry = {
  id?: string,
  month: string,
  proportion: number,
  quantity: number,
}

export type Props = {
  data: TimeIntensityEntry[];
  onClickHandler?: OnClickHandler;
};

export const TimeIntensityChart = React.memo(
  ({ data, onClickHandler }: Props): JSX.Element => {
    const [activeIndex, setActiveIndex] = useState<number>(data.length - 1);
    const [ready, setReady] = useState(false);
    const [currentData, setCurrentData] = useState<TimeIntensityEntry>(data[data.length - 1]);

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
        dataKey='proportion'
        key='proportion'
        stackId='a'
        onMouseEnter={handleMouseEnter}
        onClick={handleClick}
        isAnimationActive={false}
      >
        {data.map((entry: unknown, index: number) => (
          <Cell
            cursor={onClickHandler && 'pointer'}
            fill={index === activeIndex ? colors.highlight : colors.highlight2}
            key={`cell-${index}`}
          ></Cell>
        ))}
      </Bar>,
      <Bar
        dataKey='quantity'
        key='quantity'
        stackId='a'
        onMouseEnter={handleMouseEnter}
        onClick={handleClick}
        isAnimationActive={false}
      >
        {data.map((entry: unknown, index: number) => (
          <Cell
            cursor={onClickHandler && 'pointer'}
            fill={index === activeIndex ? colors.active : colors.secondaryLight}
            key={`cell-${index}`}
          ></Cell>
        ))}
      </Bar>,
    ];

    return ready && currentData ? (
      <Wrapper>
        <TitleWrapper id='graph_title'>
          Number of sequenced samples on {currentData.month}
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
                    <CustomTimeTick
                      activeIndex={activeIndex}
                      dataLength={data.length}
                      currentValue={currentData.month}
                    />
                  }
                />
                <YAxis
                  dataKey='quantity'
                  interval={1}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={true}
                  hide={false}
                  width={60}
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
              value={currentData.quantity}
              title='Confirmed'
              color={colors.active}
              helpText='Number of confirmed caseson this time frame.'
            />
            <Metric
              value={currentData.proportion}
              title='Sequenced'
              color={colors.highlight}
              helpText='Number of samples sequenced among the confirmed cases on this time frame.'
            />
          </MetricsWrapper>
        </ChartAndMetricsWrapper>
      </Wrapper>
    ) : (
      <p>Chart not available</p>
    );
  }
);

export default TimeIntensityChart;
