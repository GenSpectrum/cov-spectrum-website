import { Slider } from '@mui/material';
import { HexColorPicker } from 'react-colorful';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import React from 'react';

export type ColorScale = {
  minValue: number;
  maxValue: number;
  minColor: string;
  maxColor: string;
};

type Props = {
  value: ColorScale;
  onChange: (colorScale: ColorScale) => void;
};

export const ColorScaleInput = ({ value, onChange }: Props) => {
  return (
    <div className='flex items-center'>
      <ColorPicker color={value.minColor} onChange={c => onChange({ ...value, minColor: c })} />
      <div className='w-32 mx-6'>
        <Slider
          value={[value.minValue, value.maxValue]}
          onChange={(e: any) =>
            onChange({
              ...value,
              minValue: e.target.value[0],
              maxValue: e.target.value[1],
            })
          }
          valueLabelDisplay='auto'
          valueLabelFormat={x => (x * 100).toFixed(0) + '%'}
          min={0}
          max={1}
          step={0.01}
          size='small'
        />
      </div>
      <ColorPicker color={value.maxColor} onChange={c => onChange({ ...value, maxColor: c })} />
    </div>
  );
};

type ColorPickerProps = {
  color: string;
  onChange: (color: string) => void;
};

const ColorPicker = ({ color, onChange }: ColorPickerProps) => {
  const popover = (
    <Popover style={{ maxWidth: '600px' }}>
      <Popover.Body>
        <HexColorPicker color={color} onChange={onChange} />
      </Popover.Body>
    </Popover>
  );
  return (
    <OverlayTrigger trigger='click' overlay={popover} rootClose={true} transition={false} placement='top'>
      <div className='w-4 h-4 mb-1 cursor-pointer' style={{ backgroundColor: color }} />
    </OverlayTrigger>
  );
};
