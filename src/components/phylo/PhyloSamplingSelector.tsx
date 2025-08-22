import { PipeDividedOptionsButtons } from '../../helpers/ui';
import React from 'react';

export type PhyloSampling = 'only-variant' | 'whole-mrca';

type PhyloSamplingSelectorProps = {
  sampling: PhyloSampling;
  onChange: (newSampling: PhyloSampling) => void;
};

export const PhyloSamplingSelector = ({ sampling, onChange }: PhyloSamplingSelectorProps) => {
  return (
    <PipeDividedOptionsButtons
      options={[
        { label: 'Include only variant', value: 'only-variant' },
        { label: 'Whole MRCA tree', value: 'whole-mrca' },
      ]}
      selected={sampling}
      onSelect={onChange}
    />
  );
};
