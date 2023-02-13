import { Tooltip } from '@mui/material';
import { BiHelpCircle } from 'react-icons/bi';
import { PercentageInput, PercentageSlider } from './PercentageInput';
import React from 'react';

export type ProportionSelectorProps = {
  minProportion: number;
  setMinProportion: (minProportion: number) => void;
  maxProportion: number;
  setMaxProportion: (maxProportion: number) => void;
  title: string;
  tooltipTitle: string;
};

export function ProportionSelector({
  minProportion,
  maxProportion,
  setMinProportion,
  setMaxProportion,
  title,
  tooltipTitle,
}: ProportionSelectorProps) {
  return (
    <div className='w-80 flex mb-2 items-center'>
      <div className='items-center'>
        <div className='w-full flex mb-4'>
          <div>{title}</div>
          <Tooltip className='ml-1' title={tooltipTitle}>
            <div>
              <BiHelpCircle />
            </div>
          </Tooltip>
        </div>

        <div className='w-1/2 flex mb-2 items-center'>
          <PercentageInput className='mr-2' ratio={minProportion} setRatio={setMinProportion} />
          <div>-</div>
          <PercentageInput className='ml-2' ratio={maxProportion} setRatio={setMaxProportion} />
        </div>
        <PercentageSlider
          className='mx-6 w-56'
          minRatio={minProportion}
          maxRatio={maxProportion}
          setMinRatio={setMinProportion}
          setMaxRatio={setMaxProportion}
        />
      </div>
    </div>
  );
}
