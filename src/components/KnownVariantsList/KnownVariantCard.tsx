import React from 'react';
import { Card } from 'react-bootstrap';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import styled from 'styled-components';

interface Props {
  name: string;
  chartData?: number[];
  recentProportion?: number;
  selected?: boolean;
  onClick: () => void;
}

const Title = styled.div`
  margin: 5px 10px;
  font-size: 1rem;
`;

const StyledCard = styled.div`
  overflow: hidden;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.15s ease-in-out;

  &:hover {
    background-color: #e2e6ea !important;
  }
`;

const Percentage = styled.span`
  float: right;
`;

const SimpleAreaPlot = React.memo(
  ({ data, selected }: { data: number[] | undefined; selected?: boolean }) => {
    return (
      <ResponsiveContainer width='100%' height={50}>
        <AreaChart
          data={(data || []).map(y => ({ y }))}
          margin={{ top: 0, left: 0, right: 0, bottom: 0 }}
          style={{ pointerEvents: 'none' }}
        >
          <Area
            dataKey='y'
            type='basis'
            fill={selected ? '#2980b9' : '#bdc3c7'}
            fillOpacity='1'
            stroke='none'
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  }
);

export const KnownVariantCard = ({ name, chartData, recentProportion, onClick, selected }: Props) => {
  return (
    <Card className='bg-light' onClick={onClick} selected={selected}>
      <Title>
        {name}
        {chartData?.length && (
          <Percentage className='text-muted'>{(recentProportion! * 100).toFixed(1)}%</Percentage>
        )}
      </Title>
      <SimpleAreaPlot data={chartData} selected={selected} />
    </Card>
  );
};
