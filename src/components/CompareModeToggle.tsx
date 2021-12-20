import React from 'react';

interface Props {
  compareMode: boolean;
  handleModeChange: () => void;
}

export const CompareModeToggleSwitch = ({ compareMode, handleModeChange }: Props) => {
  return (
    <div className='custom-control custom-switch custom-switch-lg'>
      <input
        type='checkbox'
        className='custom-control-input'
        id='customSwitches'
        onClick={handleModeChange}
        checked={compareMode}
      />
      <label className='custom-control-label' htmlFor='customSwitches'>
        Compare Variants
      </label>
    </div>
  );
};
