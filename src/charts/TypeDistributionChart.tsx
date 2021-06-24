import React, { useEffect, useState, useCallback } from 'react';
import Metric, { MetricsWrapper } from './Metrics';
import { BarChart, XAxis, YAxis, Bar, Cell, ResponsiveContainer, CartesianGrid } from 'recharts';
import { colors, Wrapper, TitleWrapper, ChartAndMetricsWrapper, ChartWrapper } from './common';

const CHART_MARGIN_RIGHT = 15;

export type OnClickHandler = (index: number) => boolean;

type CustomTickProps = {
  x?: number;
  y?: number;
  stroke?: unknown;
  payload?: { value: string; index: number };
  activeIndex?: number;
  dataLength?: number;
  currentValue: string;
};

const CustomTick = ({ x, y, payload, currentValue }: CustomTickProps): JSX.Element => {
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
          {payload.value}
        </text>
      ) : (
        <></>
      )}
    </g>
  );
};

export type TypeDistributionEntry = {
  name: string;
  percent?: number;
  quantity: number;
};

export type TypeDistributionChartProps = {
  data: TypeDistributionEntry[];
  onClickHandler?: OnClickHandler;
};

export const TypeDistributionChart = React.memo(
  ({ data, onClickHandler }: TypeDistributionChartProps): JSX.Element => {
    const [activeIndex, setActiveIndex] = useState<number>(data.length - 1);
    const [ready, setReady] = useState(false);
    const [currentData, setCurrentData] = useState<TypeDistributionEntry>(data[data.length - 1]);

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
        {data.map((_, index: number) => (
          <Cell
            cursor={onClickHandler && 'pointer'}
            fill={index === activeIndex ? colors.active : colors.inactive}
            key={`cell-${index}`}
          ></Cell>
        ))}
      </Bar>,
    ];

    return ready && data.length > 0 && currentData ? (
      <Wrapper>
        <TitleWrapper id='graph_title'>Proportion of the variant by age (estimated)</TitleWrapper>
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
                  dataKey='name'
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  tick={
                    <CustomTick
                      activeIndex={activeIndex}
                      dataLength={data.length}
                      currentValue={currentData.name}
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
            <Metric
              value={currentData.percent === undefined ? '-' : currentData.percent.toFixed(2)}
              title='Proportion'
              color={colors.active}
              helpText='Proportion relative to all samples collected from this age group.'
              percent={true}
            />
            <Metric
              value={currentData.quantity}
              title='Samples'
              color={colors.secondary}
              helpText='Number of samples of the variant collected from this age group.'
            />
          </MetricsWrapper>
        </ChartAndMetricsWrapper>
      </Wrapper>
    ) : (
      <p>Chart not available</p>
    );
  }
);

export default TypeDistributionChart;
