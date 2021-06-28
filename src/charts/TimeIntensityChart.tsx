import React, { useEffect, useState, useCallback } from 'react';
import Metric, { MetricsWrapper } from './Metrics';
import { BarChart, XAxis, YAxis, Bar, Cell, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts';
import {
  colors,
  Wrapper,
  TitleWrapper,
  ChartAndMetricsWrapper,
  ChartWrapper,
  CustomTimeTick,
} from './common';
import { kFormat } from '../helpers/number';

const CHART_MARGIN_RIGHT = 30;
const CHART_MARGIN_BOTTOM = 0;

export type OnClickHandler = (index: number) => boolean;

export type TimeIntensityEntry = {
  id?: string;
  month: string;
  proportion: number;
  quantity: number;
};

export type Props = {
  data: TimeIntensityEntry[];
  onClickHandler?: OnClickHandler;
};

export const TimeIntensityChart = React.memo(
  ({ data, onClickHandler }: Props): JSX.Element => {
    const [currentData, setCurrentData] = useState<TimeIntensityEntry>(data[data.length - 1]);

    const resetDefault = useCallback(() => {
      setCurrentData(data[data.length - 1]);
    }, [data]);

    useEffect(() => {
      resetDefault();
    }, [data, resetDefault]);

    const handleMouseEnter = (context: unknown, index: number): void => {
      setCurrentData(data[index]);
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
        {data.map((_, index: number) => {
          return <Cell cursor={onClickHandler && 'pointer'} fill='black' key={`cell-${index}`}></Cell>;
        })}
      </Bar>,
      <Bar
        dataKey='quantity'
        key='quantity'
        stackId='a'
        onMouseEnter={handleMouseEnter}
        onClick={handleClick}
        isAnimationActive={false}
      >
        {data.map((entry: TimeIntensityEntry, index: number) => (
          <Cell
            cursor={onClickHandler && 'pointer'}
            fill={entry.id === currentData.id ? colors.secondary : colors.inactive}
            key={`cell-${index}`}
          ></Cell>
        ))}
      </Bar>,
    ];

    return currentData ? (
      <Wrapper id='sequencing-intensity-chart'>
        <TitleWrapper id='graph_title'>Number of sequenced samples on {currentData.month}</TitleWrapper>
        <ChartAndMetricsWrapper>
          <ChartWrapper className='-mr-4 -ml-2'>
            <ResponsiveContainer>
              <BarChart
                data={data}
                barCategoryGap='5%'
                margin={{ top: 0, right: CHART_MARGIN_RIGHT, left: 0, bottom: CHART_MARGIN_BOTTOM }}
                onMouseLeave={handleMouseLeave}
              >
                <XAxis
                  dataKey='month'
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  tick={
                    <CustomTimeTick
                      activeIndex={Math.round(data.length / 2)}
                      dataLength={data.length}
                      currentValue={currentData.month}
                      unit='month'
                      activeColor='black'
                    />
                  }
                />
                <YAxis
                  dataKey='quantity'
                  tickFormatter={(v: number) => kFormat(v)}
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
                <Tooltip
                  active={false}
                  cursor={false}
                  content={(e: any) => {
                    if (e?.payload.length > 0) {
                      setCurrentData(e.payload[0].payload);
                    }
                    return <></>;
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>
          <MetricsWrapper>
            <Metric
              value={kFormat(currentData.quantity)}
              title='Confirmed'
              color={colors.secondary}
              helpText='Number of confirmed cases in this time frame.'
            />
            <Metric
              value={kFormat(currentData.proportion)}
              title='Sequenced'
              color='black'
              helpText='Number of samples sequenced among the confirmed cases on this time frame.'
              showPercent={Math.round((currentData.proportion / currentData.quantity) * 100).toFixed(0)}
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
