import Select from 'react-select';
import React, { useMemo } from 'react';
import { useExploreUrl } from '../../helpers/explore-url';

export const colorByOptions = [
  { type: 'special', value: 'selectedVariant', label: 'Selected variant vs. others' },
  { type: 'metadata', value: 'pangoLineage', label: 'Pango lineage' },
  { type: 'metadata', value: 'nextcladePangoLineage', label: 'Pango lineage (Nextclade)' },
  { type: 'metadata', value: 'nextstrainClade', label: 'Nextstrain clade' },
  { type: 'metadata', value: 'region', label: 'Region' },
  { type: 'metadata', value: 'country', label: 'Country' },
  { type: 'metadata', value: 'division', label: 'Division' },
] as const;

export type ColorByOption = (typeof colorByOptions)[number];

type PhyloColorBySelectorProps = {
  options: ColorByOption[];
  selected: ColorByOption;
  onChange: (newOption: ColorByOption) => void;
};

export const PhyloColorBySelector = ({ options, selected, onChange }: PhyloColorBySelectorProps) => {
  return (
    <div className='border-t mt-4 pt-4'>
      <div className='font-bold'>Color by:</div>
      <Select value={selected} onChange={newValue => newValue && onChange(newValue)} options={options} />
    </div>
  );
};

export const useAvailableColorByOptions = () => {
  const location = useExploreUrl()!.location;
  return useMemo(() => {
    return colorByOptions.filter(({ value }) => {
      switch (value) {
        case 'region':
          return (
            location.region === undefined && location.country === undefined && location.division === undefined
          );
        case 'country':
          return location.country === undefined && location.division === undefined;
        case 'division':
          return location.division === undefined;
        default:
          return true;
      }
    });
  }, [location]);
};
