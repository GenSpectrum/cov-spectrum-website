import React, { useEffect, useState } from 'react';
import AsyncSelect from 'react-select/async';
import { components } from 'react-select';
import { isValidMutation } from '../../helpers/mutation';
import { isValidPangolinLineageQuery } from '../../helpers/variant-selector';
import {
  InputActionMeta,
  Styles
} from 'react-select';
import { CSSPseudos } from 'styled-components';
import { Button, ButtonVariant } from '../../helpers/ui';
import { GenomeService } from '../../services/GenomeService';
import { VariantSelector } from '../../helpers/sample-selector';

type SearchOption = {
  label: string;
  value: string;
  type: 'mutation' | 'pangolin-lineage';
};

function mapOption(optionString: string, type: 'mutation' | 'pangolin-lineage'): SearchOption {
  return {
    label: optionString,
    value: optionString,
    type,
  };
}

const colorStyles: Partial<Styles<any, true, any>> = {
  control: (styles: CSSPseudos) => ({ ...styles, backgroundColor: 'white' }),
  multiValue: (styles: CSSPseudos, { data }: { data: SearchOption }) => {
    return {
      ...styles,
      backgroundColor: data.type === 'pangolin-lineage' ? 'rgba(29,78,207,0.1)' : 'rgba(4,133,27,0.1)',
    };
  },
};

type Props = {
  onVariantSelect: (selection: VariantSelector) => void;
};

export const VariantSearch = ({ onVariantSelect }: Props) => {
  const [selectedOptions, setSelectedOptions] = useState<SearchOption[]>([]);
  const [pangolinLineages, setPangolinLineages] = useState<readonly string[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [menuIsOpen, setMenuIsOpen] = useState<boolean>(false);

  useEffect(() => {
    GenomeService.getKnownPangolinLineages().then(setPangolinLineages);
  }, []);

  const suggestPangolinLineages = (query: string): string[] => {
    return pangolinLineages.filter(pl => pl.toUpperCase().startsWith(query.toUpperCase()));
  };

  const suggestMutations = (query: string): string[] => {
    // TODO Fetch all/common known mutations from the server
    // For now, just providing a few mutations so that the auto-complete list is not entirely empty.
    return [
      'S:D614G',
      'ORF1b:P314L',
      'N:R203K',
      'N:G204R',
      'N:M1X',
      'ORF1a:G3676-',
      'ORF1a:S3675-',
      'ORF1a:F3677-',
      'S:N501Y',
      'S:P681H',
      'S:H69-',
      'S:V70-',
      'S:A570D',
      'S:T716I',
      'S:Y144-',
      'ORF1a:T1001I',
      'S:D1118H',
      'ORF8:Y73C',
      'ORF1a:A1708D',
      'N:S235F',
      'ORF8:Q27*',
      'S:S982A',
      'ORF8:R52I',
      'N:D3L',
      'ORF1a:I2230T',
      'ORF3a:Q57H',
      'ORF8:K68*',
      'ORF1a:T265I',
      'ORF1b:K1383R',
      'S:L452R',
      'S:A222V',
      'N:D377Y',
      'N:A220V',
      'M:I82T',
      'S:T478K',
      'S:P681R',
      'N:P199L',
      'S:L18F',
      'ORF3a:S26L',
      'ORF1a:T3255I',
      'N:R203M',
      'S:E484K',
      'ORF1b:P1000L',
      'ORF7a:T120I',
      'ORF1b:P218L',
      'ORF1b:G662S',
      'S:T19R',
      'ORF7a:V82A',
      'ORF9b:T60A',
      'N:D63G',
    ].filter(m => m.toUpperCase().startsWith(query.toUpperCase()));
  };

  const suggestOptions = (query: string): SearchOption[] => {
    const onePLAlreadySelected =
        selectedOptions.filter(option => option.type === 'pangolin-lineage').length > 0;
    const suggestions: SearchOption[] = [];
    if (isValidMutation(query)) {
      suggestions.push(mapOption(query, 'mutation'));
    } else if (!onePLAlreadySelected && isValidPangolinLineageQuery(query)) {
      suggestions.push(mapOption(query, 'pangolin-lineage'));
      if (!query.endsWith('*')) {
        suggestions.push(mapOption(query + '*', 'pangolin-lineage'));
      }
    }
    if (!onePLAlreadySelected) {
      suggestions.push(...suggestPangolinLineages(query).map(pl => mapOption(pl, 'pangolin-lineage')));
    }
    suggestions.push(...suggestMutations(query).map(pl => mapOption(pl, 'mutation')));
    return suggestions.slice(0, 20);
  };

  const handleInputChange = (newValue: string, change: InputActionMeta) => {
    if(change.action === 'input-change') {
      // when input value has "," in the string
      if (newValue.includes(",")) {
        handleCommaSeparatedInput(newValue);
      } else {
        setInputValue(newValue);
        setMenuIsOpen(true);
      }
    }

    if(change.action === 'menu-close' || change.action === 'input-blur'){
      setMenuIsOpen(false);
    }
  };

  const handleCommaSeparatedInput = (inputValue: string) => {
    const inputValues = inputValue.split(",")
    let newSelectedOptions: SearchOption[] = []
    let invalidQueries = ''
    for (let query of inputValues) {
      // remove spaces from both ends of the query
      query = query.trim()
      const suggestions = suggestOptions(query);
      const selectedOption = suggestions.find(option => option.value.toUpperCase() === query.toUpperCase());
      // If query gets back valid a valid suggest option which is not yet selected,
      // then add the query's suggest option to the newSelectedOptions to be added to selectedOptions.
      // Otherwise, append the query to the invalid queries string
      if (suggestions && suggestions.length > 0
          && selectedOption && !selectedOptions.find(option => option.value === selectedOption.value)) {
        if(selectedOption.type === 'mutation'
            // if there are more than one pangolin-lineage options in the comma separated input, we only accept the first one
            || (selectedOption.type === 'pangolin-lineage' && newSelectedOptions.filter(option => option.type === 'pangolin-lineage').length < 1)) {
          newSelectedOptions.push(selectedOption);
        }
      }else{
        invalidQueries += query + ','
      }
    }

     if (newSelectedOptions.length > 0) {
       setSelectedOptions([...selectedOptions, ...newSelectedOptions]);
     }

    // remove the last "," in the invalidQueries string
    invalidQueries = invalidQueries.slice(0, -1)
    setInputValue(invalidQueries);
    // leave options menu open if there are invalid queries from the list
    // this will show the "No Options" in the menu
    setMenuIsOpen(invalidQueries !== '');
  }

  const promiseOptions = (inputValue : string) => {
    // resets the options to default (where input value is '') when menu is closed
    if(!menuIsOpen){
      inputValue = ''
      setInputValue(inputValue);
    }

    return Promise.resolve(suggestOptions(inputValue));
  }

  const openMenu = () => {
    setMenuIsOpen(!menuIsOpen);
  };

  // Custom DropdownIndicator that calls openMenu on click, which is default behaviour.
  // This is needed because we need to manually close the menu after "selecting" by comma,
  // which overrides the default behaviour of the DropdownIndicator.
  const DropdownIndicator = (props: any) => {
    return (
        components.DropdownIndicator && (
            <div
                onClick={openMenu}
                style={{ display: "flex", alignItems: "center" }}
            >
              <components.DropdownIndicator
                  {...props}
                  onClick={() => {
                  }}
              />
            </div>
        )
    );
  };

  return (
      <div>
        <div className='text-sm mb-2'>Type in up to one pangolin lineage and any number of mutations (or paste a comma separated list):</div>
        <form
            className='w-full flex flex-row items-center'
            onSubmit={e => {
              e.preventDefault();
              const selector: VariantSelector = {
                variant: {
                  name: undefined,
                  mutations: [],
                },
                matchPercentage: 1,
              };
              for (let { type, value } of selectedOptions) {
                if (type === 'mutation') {
                  selector.variant.mutations.push(value);
                } else if (type === 'pangolin-lineage') {
                  selector.variant.name = value;
                }
              }
              onVariantSelect(selector);
            }}
        >
          <AsyncSelect
              className='w-full mr-2'
              components = {{DropdownIndicator}}
              placeholder='B.1.1.7, S:484K, ...'
              isMulti
              defaultOptions={suggestOptions('')}
              loadOptions={promiseOptions}
              onChange={(_, change) => {
                if (change.action === 'select-option') {
                  setSelectedOptions([...selectedOptions, change.option]);
                  setInputValue('');
                  setMenuIsOpen(false);
                } else if (change.action === 'remove-value' || change.action === 'pop-value') {
                  setSelectedOptions(selectedOptions.filter(o => o.value !== change.removedValue.value));
                } else if (change.action === 'clear') {
                  setSelectedOptions([]);
                  setInputValue('');
                }
              }}
              styles={colorStyles}
              onInputChange={handleInputChange}
              value={selectedOptions}
              inputValue={inputValue}
              menuIsOpen={menuIsOpen}
          />

          <Button variant={ButtonVariant.PRIMARY} className='w-40'>
            Search
          </Button>
        </form>
      </div>
  );
};
