import React from 'react';
import { HtmlPortalNode } from 'react-reverse-portal';

export type AxisPortals = {
  x: HtmlPortalNode[];
  y: HtmlPortalNode[];
};

type TwoValuesAxisProps = {
  low: string;
  high: string;
  size: number;
};

export const TwoValuesXAxis = ({ low, high, size }: TwoValuesAxisProps) => {
  return (
    <div className='flex flex-row text-sm px-1' style={{ width: size }}>
      <div>{low}</div>
      <div className='flex-1'></div>
      <div>{high}</div>
    </div>
  );
};

export const TwoValuesYAxis = ({ low, high, size }: TwoValuesAxisProps) => {
  return (
    <div className='flex flex-column text-sm px-1 text-right' style={{ height: size }}>
      <div>{high}</div>
      <div className='flex-1'></div>
      <div>{low}</div>
    </div>
  );
};
