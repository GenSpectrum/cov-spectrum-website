import React, { ReactElement } from 'react';
import styled from 'styled-components';

interface Props {
  items: ScatterLegendItem[];
}

export interface ScatterLegendItem {
  name: string;
  color: string;
  textColor: string;
  width: number;
  strokeWidth: number;
  shape: (props: { cx: number; cy: number; r: number; fill: string }) => ReactElement<SVGElement>;
}

const Row = styled.div`
  display: flex;
  align-items: center;

  :not(:last-child) {
    margin-bottom: 5px;
  }
`;

const RowText = styled.div`
  margin-left: 5px;
`;

// Recharts legends only work within their charts, but we want the legend to be outside.
// This component is a standalone legend with a small subset of Recharts features.
export const ScatterLegend = ({ items }: Props) => {
  const w = 22;
  const h = 30;
  const p = 2;

  return (
    <div>
      {items.map(item => (
        <Row key={item.name}>
          <svg width={w} height={h} viewBox={[-w / 2, -h / 2, w, h].join(' ')}>
            <g stroke={item.color} strokeWidth={item.strokeWidth}>
              <line x1={0} y1={-(h / 2 - p)} x2={0} y2={h / 2 - p} />
              <line x1={-item.width} y1={-(h / 2 - p)} x2={item.width} y2={-(h / 2 - p)} />
              <line x1={-item.width} y1={h / 2 - p} x2={item.width} y2={h / 2 - p} />
            </g>
            <item.shape cx={0} cy={0} r={5} fill={item.color} />
          </svg>
          <RowText style={{ color: item.textColor }}>{item.name}</RowText>
        </Row>
      ))}
    </div>
  );
};
