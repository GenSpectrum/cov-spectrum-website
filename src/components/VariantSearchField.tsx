import React, { useEffect, useState } from 'react';
import AsyncSelect from 'react-select/async';
import { components, InputActionMeta, Styles } from 'react-select';
import { isValidAAMutation, isValidABNotation, isValidNspNotation } from '../helpers/aa-mutation';
import { CSSPseudos } from 'styled-components';
import { PangoCountSampleData } from '../data/sample/PangoCountSampleDataset';
import { isValidPangoLineageQuery, transformToVariantQuery, VariantSelector } from '../data/VariantSelector';
import { isValidNucMutation } from '../helpers/nuc-mutation';
import { useQuery } from '../helpers/query-hook';
import { useDeepCompareEffect } from '../helpers/deep-compare-hooks';
import Form from 'react-bootstrap/Form';
import { SamplingStrategy } from '../data/SamplingStrategy';

import { translateMutation } from '../helpers/autocomplete-helpers';
import { isValidAAInsertion } from '../helpers/aa-insertion';
import { isValidNucInsertion } from '../helpers/nuc-insertion';
import { _fetchAggSamples } from '../data/api-lapis';
import { useDrop } from 'react-dnd';

type SearchType =
  | 'aa-mutation'
  | 'nuc-mutation'
  | 'aa-insertion'
  | 'nuc-insertion'
  | 'pango-lineage'
  | 'nextclade-pango-lineage'
  | 'nextstrain-clade';

type SearchOption = {
  label: string;
  value: string;
  type: SearchType;
};

const backgroundColor: { [key in SearchType]: string } = {
  'pango-lineage': 'rgba(29,78,207,0.1)',
  'nextclade-pango-lineage': 'rgba(29,78,207,0.1)',
  'nextstrain-clade': 'rgba(29,78,207,0.1)',
  'aa-mutation': 'rgba(4,133,27,0.1)',
  'nuc-mutation': 'rgba(33,162,162,0.29)',
  'aa-insertion': 'rgba(4,133,27,0.1)',
  'nuc-insertion': 'rgba(33,162,162,0.29)',
};

function mapOption(optionString: string, type: SearchType): SearchOption {
  let value = optionString;
  let label = optionString;
  if (optionString.includes(' =')) {
    value = optionString.split(' ')[0];
  } else if (optionString.toLowerCase().startsWith('nsp')) {
    if (translateMutation(optionString.toLowerCase())) {
      value = translateMutation(optionString.toLowerCase());
      label = `${value} = (${optionString})`;
    }
  } else if (optionString.toLowerCase().startsWith('orf1ab')) {
    if (translateMutation(optionString.toLowerCase())) {
      value = translateMutation(optionString.toLowerCase());
      label = `${value} = (${optionString})`;
    }
  }
  if (type === 'nextclade-pango-lineage') {
    label = `${optionString} (Nextclade)`;
  }
  if (type === 'nextstrain-clade') {
    label = `${optionString} (Nextstrain clade)`;
  }
  return {
    label,
    value,
    type,
  };
}

function variantSelectorToOptions(selector: VariantSelector): SearchOption[] {
  const options: SearchOption[] = [];
  if (selector.pangoLineage) {
    options.push({ label: selector.pangoLineage, value: selector.pangoLineage, type: 'pango-lineage' });
  }
  if (selector.nextcladePangoLineage) {
    options.push({
      label: selector.nextcladePangoLineage + ' (Nextclade)',
      value: selector.nextcladePangoLineage,
      type: 'nextclade-pango-lineage',
    });
  }
  if (selector.nextstrainClade) {
    options.push({
      label: selector.nextstrainClade + ' (Nextstrain clade)',
      value: selector.nextstrainClade,
      type: 'nextstrain-clade',
    });
  }
  if (selector.aaMutations) {
    selector.aaMutations.forEach(m => options.push({ label: m, value: m, type: 'aa-mutation' }));
  }
  if (selector.nucMutations) {
    selector.nucMutations.forEach(m => options.push({ label: m, value: m, type: 'nuc-mutation' }));
  }
  if (selector.aaInsertions) {
    selector.aaInsertions.forEach(m => options.push({ label: m, value: m, type: 'aa-insertion' }));
  }
  if (selector.nucInsertions) {
    selector.nucInsertions.forEach(m => options.push({ label: m, value: m, type: 'nuc-insertion' }));
  }
  return options;
}

function optionsToVariantSelector(options: SearchOption[]): VariantSelector {
  const selector: VariantSelector = {
    aaMutations: [],
    nucMutations: [],
    aaInsertions: [],
    nucInsertions: [],
  };
  for (let { type, value } of options) {
    if (type === 'aa-mutation') {
      selector.aaMutations!.push(value);
    } else if (type === 'nuc-mutation') {
      selector.nucMutations!.push(value);
    } else if (type === 'aa-insertion') {
      selector.aaInsertions!.push(value);
    } else if (type === 'nuc-insertion') {
      selector.nucInsertions!.push(value);
    } else if (type === 'pango-lineage') {
      selector.pangoLineage = value;
    } else if (type === 'nextclade-pango-lineage') {
      selector.nextcladePangoLineage = value;
    } else if (type === 'nextstrain-clade') {
      selector.nextstrainClade = value;
    }
  }
  return selector;
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
  const [variantQuery, setVariantQuery] = useState(currentSelection?.variantQuery ?? inputValue);
  const [advancedSearch, setAdvancedSearch] = useState(currentSelection?.variantQuery !== undefined);
  // dragEnter increases the depth by one and dragLeave decreases it. The two functions is being called every time when
  // the mouse enters or leaves the object or one of the children.
  const [dragOngoingDepth, setDragOngoingDepth] = useState(0);

  const pangoLineages = useQuery(
    signal =>
      PangoCountSampleData.fromApi(
        { location: {}, samplingStrategy: SamplingStrategy.AllSamples, host: undefined, qc: {} },
        signal
      ).then(dataset => dataset.payload.filter(e => e.pangoLineage).map(e => e.pangoLineage!)),
    []
  );

  const nextstrainCladesSet = useQuery(
    signal =>
      _fetchAggSamples(
        { location: {}, samplingStrategy: SamplingStrategy.AllSamples, host: undefined, qc: {} },
        ['nextstrainClade'],
        signal
      ).then(dataset => new Set(dataset.filter(e => e.nextstrainClade).map(e => e.nextstrainClade!))),
    []
  );

  const applySelector = (selector: VariantSelector) => {
    if (selector.variantQuery !== undefined) {
      setAdvancedSearch(true);
      setVariantQuery(selector.variantQuery);
    } else {
      setAdvancedSearch(false);
      setSelectedOptions(variantSelectorToOptions(selector));
    }
  };

  useDeepCompareEffect(() => {
    if (currentSelection) {
      applySelector(currentSelection);
    }
  }, [currentSelection]);

  const suggestPangolinLineages = (query: string): string[] => {
    return (pangoLineages.data ?? []).filter(pl => pl.toUpperCase().startsWith(query.toUpperCase()));
  };

  const suggestOptions = (query: string): SearchOption[] => {
    const onePLAlreadySelected =
      selectedOptions.filter(
        option => option.type === 'pango-lineage' || option.type === 'nextclade-pango-lineage'
      ).length > 0;
    const oneNCAlreadySelected =
      selectedOptions.filter(option => option.type === 'nextstrain-clade').length > 0;
    const suggestions: SearchOption[] = [];

    const queryWithoutNextcladeLabel = query.replace('(Nextclade)', '').trim();
    if (!onePLAlreadySelected && isValidPangoLineageQuery(queryWithoutNextcladeLabel)) {
      suggestions.push(mapOption(queryWithoutNextcladeLabel, 'nextclade-pango-lineage'));
      if (!query.includes('*')) {
        suggestions.push(mapOption(queryWithoutNextcladeLabel + '*', 'nextclade-pango-lineage'));
      }
    }
    if (isValidAAMutation(query)) {
      suggestions.push(mapOption(query, 'aa-mutation'));
    } else if (isValidABNotation(query)) {
      suggestions.push(mapOption(query, 'aa-mutation'));
    } else if (isValidNucMutation(query)) {
      suggestions.push(mapOption(query, 'nuc-mutation'));
    } else if (isValidAAInsertion(query)) {
      suggestions.push(mapOption(query, 'aa-insertion'));
    } else if (isValidNucInsertion(query)) {
      suggestions.push(mapOption(query, 'nuc-insertion'));
    } else if (!onePLAlreadySelected && isValidPangoLineageQuery(query)) {
      suggestions.push(mapOption(query, 'pango-lineage'));
      if (!query.endsWith('*')) {
        suggestions.push(mapOption(query + '*', 'pango-lineage'));
      }
    }
    const queryWithoutNextstrainLabel = query.replace('(Nextstrain clade)', '').trim();
    if (!oneNCAlreadySelected && nextstrainCladesSet.data?.has(queryWithoutNextstrainLabel.toUpperCase())) {
      suggestions.push(mapOption(queryWithoutNextstrainLabel, 'nextstrain-clade'));
    }
    if (!onePLAlreadySelected) {
      suggestions.push(...suggestPangolinLineages(query).map(pl => mapOption(pl, 'pango-lineage')));
    }
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
      const selectedOption = suggestions.find(
        option =>
          option.value.toUpperCase() === query.toUpperCase() ||
          option.label.toUpperCase() === query.toUpperCase()
      );
      if (
        suggestions &&
        suggestions.length > 0 &&
        selectedOption &&
        !selectedOptions.find(option => option.value === selectedOption.value)
      ) {
        if (
          selectedOption.type === 'aa-mutation' ||
          selectedOption.type === 'nuc-mutation' ||
          selectedOption.type === 'aa-insertion' ||
          selectedOption.type === 'nuc-insertion' ||
          ((selectedOption.type === 'pango-lineage' || selectedOption.type === 'nextclade-pango-lineage') &&
            newSelectedOptions.filter(
              option => option.type === 'pango-lineage' || option.type === 'nextclade-pango-lineage'
            ).length < 1) ||
          (selectedOption.type === 'nextstrain-clade' &&
            newSelectedOptions.filter(option => option.type === 'nextstrain-clade').length < 1)
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
        onVariantSelect(optionsToVariantSelector(selectedOptions));
      } else {
        onVariantSelect({ variantQuery });
      }
    };
    submitVariant();
  }, [selectedOptions, variantQuery, advancedSearch, onVariantSelect]);

  function handleCheckboxChange() {
    let newQuery: string = '';
    if (selectedOptions.length > 0) {
      const selector = optionsToVariantSelector(selectedOptions);
      newQuery = transformToVariantQuery(selector);
    } else if (inputValue) {
      newQuery = inputValue;
    }
    setAdvancedSearch(!advancedSearch);
    setVariantQuery(newQuery);
  }

  // --- Drag&drop ---

  const dropToField = (query: any) => {
    if (query) {
      const selector = JSON.parse(query) as VariantSelector;
      applySelector(selector);
    }
  };

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'div',
    drop: (item: any) => dropToField(item.query),
    collect: monitor => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const dragOver = (ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = 'copy';
  };

  const dragEnter = () => {
    setDragOngoingDepth(d => d + 1);
  };

  const dragLeave = () => {
    setDragOngoingDepth(d => Math.max(0, d - 1));
  };

  const dropFromMouse = (ev: React.DragEvent<HTMLDivElement>) => {
    const droppedItem = ev.dataTransfer.getData('drag-item');
    if (droppedItem) {
      const selector = JSON.parse(droppedItem) as VariantSelector;
      applySelector(selector);
    }
    setDragOngoingDepth(0);
  };

  // --- Rendering ---

  return (
    <div
      onDragOver={dragOver}
      onDragEnter={dragEnter}
      onDragLeave={dragLeave}
      onDrop={dropFromMouse}
      ref={drop}
      className={
        'm-1 p-1 border-2 border-dashed ' +
        (isOver || dragOngoingDepth ? 'border-black' : 'border-transparent')
      }
    >
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
            placeholder='ins_S:214:EPE, ins_22204:?GAG?GAA?, B.1.1.7, S:484K, C913'
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
          className='mb-3'
        />
      </div>
    </div>
  );
};
