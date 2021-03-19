import React, { useEffect, useState, useCallback } from 'react';
import Metric, { MetricsWrapper, MetricsSpacing } from './Metrics';
import { BarChart, XAxis, YAxis, Bar, Cell, ResponsiveContainer, CartesianGrid } from 'recharts';
import { colors, Wrapper, TitleWrapper, ChartAndMetricsWrapper, ChartWrapper } from './common';

const CHART_MARGIN_RIGHT = 15;

export type OnClickHandler = (index: number) => boolean;

// const getTickText = (value: string, dataLength: number, activeIndex: number, index: number) => {
//   return value;
// };

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
          {/* {getTickText(payload.value, dataLength, activeIndex, payload.index)} */}
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
  percent: number;
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
          Estimated Age Distribution
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

export default TypeDistributionChart;
