import React, { useEffect, useState } from 'react';
import AsyncSelect from 'react-select/async';
import { components, InputActionMeta, Styles } from 'react-select';
import { isValidAAMutation, isValidABNotation, isValidNspNotation } from '../helpers/aa-mutation';
import { CSSPseudos } from 'styled-components';
import { PangoCountSampleData } from '../data/sample/PangoCountSampleDataset';
import { isValidPangoLineageQuery, VariantSelector } from '../data/VariantSelector';
import { isValidNucMutation } from '../helpers/nuc-mutation';
import { useQuery } from '../helpers/query-hook';
import { useDeepCompareEffect } from '../helpers/deep-compare-hooks';
import Form from 'react-bootstrap/Form';
import { SamplingStrategy } from '../data/SamplingStrategy';
import { getEquivalent, translateMutation } from '../helpers/autocomplete-helpers';
import { useExploreUrl } from '../helpers/explore-url';

type SearchType = 'aa-mutation' | 'nuc-mutation' | 'pango-lineage';

type SearchOption = {
  label: string;
  value: string;
  type: SearchType;
};

const backgroundColor: { [key in SearchType]: string } = {
  'pango-lineage': 'rgba(29,78,207,0.1)',
  'aa-mutation': 'rgba(4,133,27,0.1)',
  'nuc-mutation': 'rgba(33,162,162,0.29)',
};

function mapOption(optionString: string, type: SearchType): SearchOption {
  let actualValue = optionString;
  if (optionString.includes(' =')) {
    actualValue = optionString.split(' ')[0];
  } else if (optionString.toLowerCase().startsWith('nsp')) {
    if (translateMutation(optionString.toLowerCase())) {
      actualValue = translateMutation(optionString.toLowerCase());
      optionString = `${actualValue} = (${optionString})`;
    }
  } else if (optionString.toLowerCase().startsWith('orf1ab')) {
    if (translateMutation(optionString.toLowerCase())) {
      actualValue = translateMutation(optionString.toLowerCase());
      optionString = `${actualValue} = (${optionString})`;
    }
  }
  return {
    label: optionString,
    value: actualValue,
    type,
  };
}

function variantSelectorToOptions(selector: VariantSelector): SearchOption[] {
  const options: SearchOption[] = [];
  if (selector.pangoLineage) {
    options.push({ label: selector.pangoLineage, value: selector.pangoLineage, type: 'pango-lineage' });
  }
  if (selector.aaMutations) {
    selector.aaMutations.forEach(m => options.push({ label: m, value: m, type: 'aa-mutation' }));
  }
  if (selector.nucMutations) {
    selector.nucMutations.forEach(m => options.push({ label: m, value: m, type: 'nuc-mutation' }));
  }
  return options;
}

const colorStyles: Partial<Styles<any, true, any>> = {
  control: (styles: CSSPseudos) => ({ ...styles, backgroundColor: 'white' }),
  multiValue: (styles: CSSPseudos, { data }: { data: SearchOption }) => {
    return {
      ...styles,
      backgroundColor: backgroundColor[data.type],
    };
  },
};

type Props = {
  currentSelection?: VariantSelector;
  onVariantSelect: (selection: VariantSelector) => void;
  isSimple: boolean;
  triggerSearch: () => void;
};

export const VariantSearchField = ({ onVariantSelect, currentSelection, triggerSearch }: Props) => {
  const [selectedOptions, setSelectedOptions] = useState<SearchOption[]>(
    currentSelection ? variantSelectorToOptions(currentSelection) : []
  );
  const [inputValue, setInputValue] = useState<string>('');
  const [menuIsOpen, setMenuIsOpen] = useState<boolean>(false);
  const [variantQuery, setVariantQuery] = useState(currentSelection?.variantQuery ?? '');
  const [advancedSearch, setAdvancedSearch] = useState(!!currentSelection?.variantQuery);
  const exploreUrl = useExploreUrl();

  const pangoLineages = useQuery(
    signal =>
      PangoCountSampleData.fromApi(
        { location: {}, samplingStrategy: SamplingStrategy.AllSamples, host: undefined, qc: {} },
        signal
      ).then(dataset => dataset.payload.filter(e => e.pangoLineage).map(e => e.pangoLineage!)),
    []
  );

  useDeepCompareEffect(() => {
    if (currentSelection) {
      if (currentSelection.variantQuery) {
        setAdvancedSearch(true);
        setVariantQuery(currentSelection.variantQuery);
      } else {
        setAdvancedSearch(false);
        setSelectedOptions(variantSelectorToOptions(currentSelection));
      }
    }
  }, [currentSelection]);

  useEffect(() => {
    if (exploreUrl) {
      console.log(JSON.stringify(exploreUrl));
      setAdvancedSearch(true);
      if (exploreUrl.variant) {
        let values: SearchOption[] = [];
        if (exploreUrl.variant.pangoLineage) {
          values.push({
            label: exploreUrl.variant.pangoLineage,
            value: exploreUrl.variant.pangoLineage,
            type: 'pango-lineage',
          });
          if (exploreUrl.variant.nucMutations) {
            for (let i of exploreUrl.variant.nucMutations) {
              values.push({ label: i, value: i, type: 'nuc-mutation' });
            }
          }
          if (exploreUrl.variant.aaMutations) {
            for (let i of exploreUrl.variant.aaMutations) {
              values.push({ label: i, value: i, type: 'aa-mutation' });
            }
          }
        }
        setSelectedOptions(values);
        setVariantQuery(selectedOptions.map(i => i.value).join(' & '));
      }
      if (exploreUrl.variant?.variantQuery) {
        setVariantQuery(exploreUrl.variant.variantQuery);
      }
    }
  }, [currentSelection, exploreUrl?.focusKey, exploreUrl?.variant]);

  const suggestPangolinLineages = (query: string): string[] => {
    return (pangoLineages.data ?? []).filter(pl => pl.toUpperCase().startsWith(query.toUpperCase()));
  };

  const suggestMutations = (query: string): string[] => {
    // TODO Fetch all/common known mutations from the server
    // For now, just providing a few mutations so that the auto-complete list is not entirely empty.
    let notation = query.toLowerCase().startsWith('n') ? 'nsp' : query.startsWith('orf1ab') ? 'orf1ab' : '';
    let options: string[] = [
      'S:D614G',
      'ORF1b:P314L',
      'N:R203K',
      'N:G204R',
      'N:M1X',
      'ORF1a:G3676',
      'ORF1a:S3675',
      'ORF1a:F3677',
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
      'ORF1a:T1001I',
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
    ].map(i => {
      if (i.startsWith('ORF1') && (notation === 'nsp' || notation === 'orf1ab')) {
        return `${i} = (${getEquivalent(i, notation)})`;
      }
      return i;
    });
    return options.filter(m => m.toUpperCase().includes(query.toUpperCase()));
  };

  const suggestOptions = (query: string): SearchOption[] => {
    const onePLAlreadySelected = selectedOptions.filter(option => option.type === 'pango-lineage').length > 0;
    const suggestions: SearchOption[] = [];

    if (isValidAAMutation(query)) {
      suggestions.push(mapOption(query, 'aa-mutation'));
    } else if (isValidABNotation(query)) {
      suggestions.push(mapOption(query, 'aa-mutation'));
    } else if (isValidNucMutation(query)) {
      suggestions.push(mapOption(query, 'nuc-mutation'));
    } else if (!onePLAlreadySelected && isValidPangoLineageQuery(query)) {
      suggestions.push(mapOption(query, 'pango-lineage'));
      if (!query.endsWith('*')) {
        suggestions.push(mapOption(query + '*', 'pango-lineage'));
      }
    }
    if (!onePLAlreadySelected) {
      suggestions.push(...suggestPangolinLineages(query).map(pl => mapOption(pl, 'pango-lineage')));
    }
    suggestions.push(...suggestMutations(query).map(pl => mapOption(pl, 'aa-mutation')));
    return suggestions.slice(0, 20);
  };

  // nsp + ':' + letterBefore + nspCodon; //
  /**
   * Handles the input change:
   * 1) when input value contains "," or "+", call the handleCommaSeparatedInput function
   * 2) otherwise, set the input value to the new value and keep menu window open
   * 3) when input change action is menu-close or input-blur, close menu window
   * @param newValue the new input value
   * @param change the change action
   */
  const handleInputChange = (newValue: string, change: InputActionMeta) => {
    if (change.action === 'input-change') {
      // when input value has "," or "+" in the string
      if (newValue.includes(',') || newValue.includes('+')) {
        handleCommaSeparatedInput(newValue);
      } else {
        setInputValue(newValue);
        setMenuIsOpen(true);
      }
    }

    if (change.action === 'menu-close' || change.action === 'input-blur') {
      setMenuIsOpen(false);
    }
  };

  /**
   * Handles comma-separated input value:
   * 1) split the input value by "," and "+" to retrieve the individual query in the list
   * 2) validate each input query by mapping to suggest options
   * 3) add valid options to the selected options list so they transform from plain text to tags
   * 4) max 1 pango lineage but multiple mutations allowed
   * 5) invalid queries stay as comma-separated plain text
   * 6) leave options menu open if there are invalid queries from the list
   * @param inputValue comma-separated string
   */
  const handleCommaSeparatedInput = (inputValue: string) => {
    // const input = inputValue.split(/[,+]/);
    const inputValues = inputValue.split(/[,+]/).map(value => {
      if (isValidABNotation(value)) {
        return translateMutation(value);
      } else if (isValidNspNotation(value)) {
        return translateMutation(value);
      } else {
        return value;
      }
    });
    let newSelectedOptions: SearchOption[] = [];
    let invalidQueries = '';
    for (let query of inputValues) {
      query = query.trim();
      const suggestions = suggestOptions(query);
      const selectedOption = suggestions.find(option => option.value.toUpperCase() === query.toUpperCase());
      if (
        suggestions &&
        suggestions.length > 0 &&
        selectedOption &&
        !selectedOptions.find(option => option.value === selectedOption.value)
      ) {
        if (
          selectedOption.type === 'aa-mutation' ||
          selectedOption.type === 'nuc-mutation' ||
          (selectedOption.type === 'pango-lineage' &&
            newSelectedOptions.filter(option => option.type === 'pango-lineage').length < 1)
        ) {
          newSelectedOptions.push(selectedOption);
        }
      } else {
        invalidQueries += query + ',';
      }
    }

    if (newSelectedOptions.length > 0) {
      setSelectedOptions([...selectedOptions, ...newSelectedOptions]);
    }

    // remove the last "," in the invalidQueries string
    invalidQueries = invalidQueries.slice(0, -1);
    setInputValue(invalidQueries);
    setMenuIsOpen(invalidQueries !== '');
  };

  const promiseOptions = (inputValue: string) => {
    // resets the options to default (where input value is '') when menu is closed
    if (!menuIsOpen) {
      inputValue = '';
      setInputValue(inputValue);
    }

    return Promise.resolve(suggestOptions(inputValue));
  };

  const openMenu = () => {
    setMenuIsOpen(!menuIsOpen);
  };

  /**
   * This is needed because the code is converted to manually opening/closing the option menu,
   * which overrides the default behaviour of the DropdownIndicator.
   * @param props props of component
   * @constructor the constructor
   */
  const DropdownIndicator = (props: any) => {
    return (
      components.DropdownIndicator && (
        <div onClick={openMenu} style={{ display: 'flex', alignItems: 'center' }}>
          <components.DropdownIndicator {...props} onClick={() => {}} children={props.children} />
        </div>
      )
    );
  };

  useEffect(() => {
    const submitVariant = () => {
      if (!advancedSearch) {
        const selector: VariantSelector = {
          aaMutations: [],
          nucMutations: [],
        };
        for (let { type, value } of selectedOptions) {
          if (type === 'aa-mutation') {
            selector.aaMutations!.push(value);
          } else if (type === 'nuc-mutation') {
            selector.nucMutations!.push(value);
          } else if (type === 'pango-lineage') {
            selector.pangoLineage = value;
          }
        }
        onVariantSelect(selector);
      } else {
        onVariantSelect({ variantQuery });
      }
    };
    submitVariant();
  }, [selectedOptions, variantQuery, advancedSearch, onVariantSelect]);

  function handleCheckboxChange() {
    let newQuery: string = '';
    if (selectedOptions.length > 0) {
      newQuery = selectedOptions.map(i => i.value).join(' & ');
    } else if (inputValue) {
      newQuery = inputValue;
    }
    setAdvancedSearch(!advancedSearch);
    setVariantQuery(newQuery);
  }

  return (
    <div>
      {inputValue}
      <form
        className='w-full flex flex-row items-center'
        onSubmit={e => {
          e.preventDefault();
          triggerSearch();
        }}
      >
        {!advancedSearch ? (
          <AsyncSelect
            className='w-full mr-2'
            components={{ DropdownIndicator }}
            placeholder='B.1.1.7, S:484K, C913'
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
        ) : (
          <Form.Control
            type='text'
            placeholder='(B.1.1.529* | S:67V) & !C913T'
            className='w-full mr-2'
            value={variantQuery}
            onChange={e => setVariantQuery(e.target.value)}
          />
        )}
      </form>
      <div>
        <Form.Check
          type='checkbox'
          label='Advanced search'
          checked={advancedSearch}
          onChange={_ => handleCheckboxChange()}
        />
      </div>
    </div>
  );
};
