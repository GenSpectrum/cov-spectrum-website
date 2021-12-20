import React from 'react';

interface Props {
  handleModeChange: () => void;
}

export const CompareModeToggleSwitch = ({ handleModeChange }: Props) => {
  return (
    <div className='custom-control custom-switch custom-switch-lg'>
      <input
        type='checkbox'
        className='custom-control-input'
        id='customSwitches'
        onClick={handleModeChange}
      />
      <label className='custom-control-label' htmlFor='customSwitches'>
        Compare Variants
      </label>
    </div>
  );
};
