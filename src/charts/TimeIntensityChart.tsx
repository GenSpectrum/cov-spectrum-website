import React, { useEffect, useState, useCallback } from 'react';
import Metric, { MetricsWrapper, MetricsSpacing } from './Metrics';
import { BarChart, XAxis, YAxis, Bar, Cell, ResponsiveContainer, CartesianGrid , Tooltip} from 'recharts';
import {
  colors,
  Wrapper,
  TitleWrapper,
  ChartAndMetricsWrapper,
  ChartWrapper,
  CustomTimeTick,
  CustomTimeTickProps,
} from './common';

const CHART_MARGIN_RIGHT = 15;

export type OnClickHandler = (index: number) => boolean;

export type TimeIntensityEntry = {
  firstDayInWeek: string;
  yearWeek: string;
  quantity: number;
  proportion: number;
};

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
            fill={index === activeIndex ? colors.active : colors.secondary}
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
            fill={index === activeIndex ? colors.active : colors.inactive}
            key={`cell-${index}`}
          ></Cell>
        ))}
      </Bar>,
    ];

    return ready && currentData ? (
      <Wrapper>
        <TitleWrapper id='graph_title'>
          Number of sequenced samples on week {currentData.yearWeek.split('-')[1]}
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
                    <CustomTimeTick
                      activeIndex={activeIndex}
                      dataLength={data.length}
                      currentValue={currentData.yearWeek}
                    />
                  }
                />
                <Tooltip formatter={format} />
                <CartesianGrid vertical={false} />
                {bars}
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </ChartAndMetricsWrapper>
      </Wrapper>
    ) : (
      <p>Chart not available</p>
    );
  }
);

const format = (value: unknown, name: string, props: unknown) => {
  if (name === "proportion") {
    return [value, "Sequenced"]
  }
  else {
    return ['formatted value', 'name'];
  }
}

export default TimeIntensityChart;
