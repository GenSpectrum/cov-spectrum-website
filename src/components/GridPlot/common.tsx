import React from 'react';

type TwoValuesAxisProps = {
  low: string;
  high: string;
};

export const TwoValuesXAxis = ({ low, high }: TwoValuesAxisProps) => {
  return (
    <div className='flex flex-row text-sm px-1'>
      <div>{low}</div>
      <div className='flex-1'></div>
      <div>{high}</div>
    </div>
  );
};

export const TwoValuesYAxis = ({ low, high }: TwoValuesAxisProps) => {
  return (
    <div className='flex flex-column text-sm px-1 text-right h-100'>
      <div>{high}</div>
      <div className='flex-1'></div>
      <div>{low}</div>
    </div>
  );
};
