import React from 'react';
import { Card } from 'react-bootstrap';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import styled from 'styled-components';

interface Props {
  name: string;
  selected?: boolean;
  onClick: () => void;
}

const data = [{ y: 10 }, { y: 18 }, { y: 15 }, { y: 20 }, { y: 25 }];

const Title = styled.div`
  margin: 10px 15px;
  font-size: 1rem;
`;

const StyledCard = styled.div`
  overflow: hidden;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.15s ease-in-out;

  ${({ selected }: { selected: boolean }) => selected && 'text-decoration: underline;'}

  &:hover {
    background-color: #e2e6ea !important;
  }
`;

export const KnownVariantCard = ({ name, onClick, selected }: Props) => {
  return (
    <Card as={StyledCard} className='bg-light' onClick={onClick} selected={selected}>
      <Title>{name}</Title>
      <ResponsiveContainer width='100%' height={50}>
        <AreaChart
          data={data}
          margin={{ top: 0, left: 0, right: 0, bottom: 0 }}
          style={{ pointerEvents: 'none' }}
        >
          <Area
            dataKey='y'
            type='monotone'
            fill='#2980b9'
            fillOpacity='1'
            stroke='none'
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};
