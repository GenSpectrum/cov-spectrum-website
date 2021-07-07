import React, { useState } from 'react';
import AsyncSelect from 'react-select/async';
import { isValidMutation } from '../../helpers/mutation';
import { isValidPangolinLineageQuery } from '../../helpers/variant-selector';
import { Styles } from 'react-select';
import { CSSPseudos } from 'styled-components';
import { Button, ButtonVariant } from '../../helpers/ui';

type SearchOption = {
  label: string;
  value: string;
  type: 'mutation' | 'pangolin-lineage';
};

function mapOptions(optionStrings: string[], type: 'mutation' | 'pangolin-lineage'): SearchOption[] {
  return optionStrings.map(x => ({
    label: x,
    value: x,
    type,
  }));
}

const colorStyles: Partial<Styles<any, true, any>> = {
  control: (styles: CSSPseudos) => ({ ...styles, backgroundColor: 'white' }),
  multiValue: (styles: CSSPseudos, { data }: { data: SearchOption }) => {
    return {
      ...styles,
      backgroundColor: data.type === 'pangolin-lineage' ? 'rgba(172,44,86,0.1)' : 'rgba(0,56,44,0.1)',
    };
  },
};

export const VariantSearch = () => {
  const [selectedOptions, setSelectedOptions] = useState<SearchOption[]>([]);

  const suggestPangolinLineages = (query: string): string[] => {
    // Fetch all existing pangolin lineages
    return [];
  };

  const suggestMutations = (query: string): string[] => {
    // Fetch all existing mutations
    return [];
  };

  const suggestOptions = (query: string): SearchOption[] => {
    const onePLAlreadySelected =
      selectedOptions.filter(option => option.type === 'pangolin-lineage').length > 0;
    const suggestions: SearchOption[] = [];
    if (isValidMutation(query)) {
      suggestions.push({
        label: query,
        value: query,
        type: 'mutation',
      });
    } else if (!onePLAlreadySelected && isValidPangolinLineageQuery(query)) {
      suggestions.push({
        label: query,
        value: query,
        type: 'pangolin-lineage',
      });
      if (!query.endsWith('*')) {
        suggestions.push({
          label: query + '*',
          value: query + '*',
          type: 'pangolin-lineage',
        });
      }
    }
    if (!onePLAlreadySelected) {
      suggestions.push(...mapOptions(suggestPangolinLineages(query), 'pangolin-lineage'));
    }
    suggestions.push(...mapOptions(suggestMutations(query), 'mutation'));

    return suggestions;
  };

  return (
    <div>
      <div className='text-sm mb-2'>Type up to one pangolin lineage and any number of mutations:</div>
      <AsyncSelect
        closeMenuOnSelect={false}
        placeholder='B.1.1.7, S:484K, ...'
        isMulti
        defaultOptions={suggestOptions('')}
        loadOptions={(query: string) => Promise.resolve(suggestOptions(query))}
        onChange={(_, change) => {
          if (change.action === 'select-option') {
            setSelectedOptions([...selectedOptions, change.option]);
          } else if (change.action === 'remove-value' || change.action === 'pop-value') {
            setSelectedOptions(selectedOptions.filter(o => o.value !== change.removedValue.value));
          }
        }}
        styles={colorStyles}
      />
      <div className='mt-2'>
        <Button variant={ButtonVariant.PRIMARY} className='w-40'>
          Search
        </Button>
      </div>
    </div>
  );
};
