import React from 'react';
import { InputAdornment, OutlinedInput, Slider } from '@mui/material';

export type PercentageInputProps = {
  ratio: number;
  setRatio: (percentage: number) => void;
  className?: string;
};

export function PercentageInput({ ratio, setRatio, className }: PercentageInputProps) {
  const displayValue = jsWorkaroundForFloatingPointConversionOfStrings(ratio);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const percentage = Number(event.target.value) / 100;
    setRatio(percentage);
  };

  return (
    <OutlinedInput
      className={`h-8 w-32 ${className}`}
      value={displayValue}
      onChange={handleInputChange}
      endAdornment={<InputAdornment position='end'>%</InputAdornment>}
      inputProps={{
        inputMode: 'numeric',
        step: 0.1,
        min: 0,
        max: 100,
        type: 'number',
        lang: 'en',
        className: 'w-20', // for numbers with 2.3f
      }}
    />
  );
}

function jsWorkaroundForFloatingPointConversionOfStrings(ratio: number) {
  return parseFloat((ratio * 100).toFixed(3));
}

export type PercentageSliderProps = {
  minRatio: number;
  maxRatio: number;
  setMinRatio: (percentage: number) => void;
  setMaxRatio: (percentage: number) => void;
  className?: string;
};

export function PercentageSlider({
  minRatio,
  maxRatio,
  setMinRatio,
  setMaxRatio,
  className,
}: PercentageSliderProps) {
  const handleSliderChange = (newValue: number[]) => {
    const newValueArray = newValue as number[];
    setMinRatio(newValueArray[0] / 100);
    setMaxRatio(newValueArray[1] / 100);
  };

  const marks = [
    { value: 0, label: '0%' },
    { value: 20, label: '20%' },
    { value: 40, label: '40%' },
    { value: 60, label: '60%' },
    { value: 80, label: '80%' },
    { value: 100, label: '100%' },
  ];

  return (
    <Slider
      className={className}
      value={[minRatio * 100, maxRatio * 100]}
      onChange={(event, newValue) => handleSliderChange(newValue as number[])}
      min={0}
      max={100}
      step={0.1}
      disableSwap={true}
      size={'small'}
      inputMode={'numeric'}
      marks={marks}
    />
  );
}
