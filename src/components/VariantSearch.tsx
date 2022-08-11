import { formatVariantDisplayName, VariantSelector } from '../data/VariantSelector';
import { Button, ButtonVariant } from '../helpers/ui';
import React, { useEffect, useState } from 'react';
import { VariantSearchField } from './VariantSearchField';
import { AnalysisMode } from '../data/AnalysisMode';
import { FaArrowUp } from 'react-icons/fa';
import { AiFillDelete } from 'react-icons/ai';

type Props = {
  currentSelection?: VariantSelector[];
  onVariantSelect: (selections: VariantSelector[], analysisMode?: AnalysisMode) => void;
  analysisMode: AnalysisMode;
};

type SelectorWithId = {
  selector: VariantSelector;
  id: number;
};

const defaultSelections: SelectorWithId[] = [
  {
    selector: {},
    id: Math.random(),
  },
];

export const VariantSearch = ({ currentSelection, onVariantSelect, analysisMode }: Props) => {
  const [selections, setSelections] = useState<SelectorWithId[]>(defaultSelections);

  useEffect(() => {
    if (currentSelection) {
      setSelections(
        currentSelection.map(selector => ({
          selector,
          id: Math.random(),
        }))
      );
    } else {
      setSelections(defaultSelections);
    }
  }, [currentSelection]);

  // --- Functions to modify and submit selection ---

  const removeSelection = (index: number) => {
    const newSelections = [];
    for (let i = 0; i < selections.length; i++) {
      if (index !== i) {
        newSelections.push(selections[i]);
      }
    }
    if (newSelections.length === 0) {
      newSelections.push({
        selector: {},
        id: Math.random(),
      });
    }
    setSelections(newSelections);
  };

  const addSelection = () => {
    setSelections([
      ...selections,
      {
        selector: {},
        id: Math.random(),
      },
    ]);
  };

  const changeSelection = (newSelection: VariantSelector, index: number) => {
    if (
      formatVariantDisplayName(newSelection, true) ===
      formatVariantDisplayName(selections[index].selector, true)
    ) {
      return;
    }
    const newSelections = [];
    for (let i = 0; i < selections.length; i++) {
      if (index !== i) {
        newSelections.push(selections[i]);
      } else {
        newSelections.push({
          selector: newSelection,
          id: selections[i].id,
        });
      }
    }
    setSelections(newSelections);
  };

  const moveSelectionToTop = (index: number) => {
    const newTopSelection = selections[index];
    const newSelections = [newTopSelection];
    for (let i = 0; i < selections.length; i++) {
      if (index !== i) {
        newSelections.push(selections[i]);
      }
    }
    setSelections(newSelections);
  };

  const submitSearch = () => {
    onVariantSelect(
      selections.map(s => s.selector),
      analysisMode
    );
  };

  // --- Rendering ---

  if (analysisMode === AnalysisMode.Single) {
    // Only render the first variant, don't allow adding and removing search fields
    return (
      <div className='flex flex-wrap'>
        <div className='flex-grow'>
          <VariantSearchField
            key={selections[0].id}
            isSimple={false}
            currentSelection={selections[0].selector}
            onVariantSelect={newSelection => changeSelection(newSelection, 0)}
            triggerSearch={submitSearch}
          />
        </div>
        <Button
          variant={ButtonVariant.PRIMARY}
          className='w-full sm:w-40 sm:mt-3'
          onClick={() => submitSearch()}
        >
          Search
        </Button>
      </div>
    );
  }

  if (analysisMode === AnalysisMode.CompareEquals) {
    return (
      <div className='flex flex-wrap w-full'>
        <div className='flex-grow'>
          <div>
            {selections.map((selection, index) => (
              <div className='flex mr-4' key={selection.id}>
                <div className='flex-grow'>
                  <VariantSearchField
                    key={selection.id}
                    isSimple={false}
                    currentSelection={selection.selector}
                    onVariantSelect={newSelection => changeSelection(newSelection, index)}
                    triggerSearch={submitSearch}
                    analysisMode={analysisMode}
                  />
                </div>
                <button
                  className='mb-9 outline-none hover:text-red-500'
                  onClick={() => removeSelection(index + 1)}
                  title='Delete'
                >
                  <AiFillDelete />
                </button>
              </div>
            ))}
          </div>

          <button className='underline cursor-pointer outline-none ml-1' onClick={() => addSelection()}>
            Add variant
          </button>
        </div>
        <Button variant={ButtonVariant.PRIMARY} className='w-40 mt-3 ml-2' onClick={() => submitSearch()}>
          Search
        </Button>
      </div>
    );
  }

  if (analysisMode === AnalysisMode.CompareToBaseline) {
    return (
      <div className='flex flex-wrap w-full'>
        <div className='flex-grow'>
          <span className='ml-1'>Baseline variant:</span>
          <div className=''>
            <VariantSearchField
              key={selections[0].id}
              isSimple={false}
              currentSelection={selections[0].selector}
              onVariantSelect={newSelection => changeSelection(newSelection, 0)}
              triggerSearch={submitSearch}
              analysisMode={analysisMode}
            />
          </div>
          <span className='ml-1'>Comparing with:</span>
          <div>
            {selections.slice(1).map((selection, index) => (
              <div className='flex' key={selection.id}>
                <div className='flex-grow'>
                  <VariantSearchField
                    key={selection.id}
                    isSimple={false}
                    currentSelection={selection.selector}
                    onVariantSelect={newSelection => changeSelection(newSelection, index + 1)}
                    triggerSearch={submitSearch}
                    analysisMode={analysisMode}
                  />
                </div>
                <div className='mt-1 flex flex-column'>
                  <button
                    className='mb-2 outline-none hover:text-red-500'
                    onClick={() => removeSelection(index + 1)}
                    title='Delete'
                  >
                    <AiFillDelete />
                  </button>
                  <button
                    className='outline-none hover:text-blue-500'
                    onClick={() => moveSelectionToTop(index + 1)}
                    title='Set as baseline'
                  >
                    <FaArrowUp />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className='underline cursor-pointer outline-none ml-1' onClick={() => addSelection()}>
            Add variant
          </button>
        </div>
        <Button variant={ButtonVariant.PRIMARY} className='w-40 mt-9' onClick={() => submitSearch()}>
          Search
        </Button>
      </div>
    );
  }

  throw new Error('Unexpected analysis mode: ' + analysisMode);
};
