import { VariantSearchField } from '../VariantSearchField';
import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { DndProvider } from 'react-dnd';
import { TestBackend } from 'react-dnd-test-backend';
import userEvent from '@testing-library/user-event';
import { PangoCountSampleData } from '../../data/sample/PangoCountSampleDataset';
import { _fetchAggSamples } from '../../data/api-lapis';
import { isValidPangoLineageQuery } from '../../data/VariantSelector';

jest.mock('../../data/sample/PangoCountSampleDataset');
const fromApiMock = jest.fn();
PangoCountSampleData.fromApi = fromApiMock;

jest.mock('../../data/api-lapis');
const fetchAggSamplesMock = _fetchAggSamples as jest.Mock;

const onVariantSelectMock = jest.fn();
const triggerSearchMock = jest.fn();

function getSearchTextField() {
  return screen.getByRole('combobox');
}

async function renderVariantSearchField() {
  await act(() => {
    render(
      <DndProvider backend={TestBackend}>
        <VariantSearchField onVariantSelect={onVariantSelectMock} triggerSearch={triggerSearchMock} />
      </DndProvider>
    );
  });
}

describe('VariantSearchField', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    fromApiMock.mockResolvedValue({ payload: [] });
    fetchAggSamplesMock.mockResolvedValue([]);
  });

  describe('the simple search field', () => {
    function getSearchValueThatLooksLikeAPangoLineage() {
      const pangoLineageSearchKey = 'A';
      expect(isValidPangoLineageQuery(pangoLineageSearchKey)).toBe(true);
      return pangoLineageSearchKey;
    }

    test('should display input field with placeholder', async () => {
      await renderVariantSearchField();

      const placeholder = 'ins_S:214:EPE, ins_22204:?GAG?GAA?, B.1.1.7, S:484K, C913';
      expect(screen.getByText(placeholder)).toBeInTheDocument();
      expect(getSearchTextField()).toBeInTheDocument();
    });

    test('should display search key in input field', async () => {
      await renderVariantSearchField();

      await userEvent.type(getSearchTextField(), 'TestStrain');

      expect(getSearchTextField()).toHaveValue('TestStrain');
    });

    test('should open dropdown menu on input', async () => {
      await renderVariantSearchField();
      expect(screen.queryByText('No options')).not.toBeInTheDocument();

      await userEvent.type(getSearchTextField(), 'NotAPangoLineage');

      expect(screen.getByText('No options')).toBeInTheDocument();
    });

    test('should display default autocomplete suggestions for pangoLineage input', async () => {
      await renderVariantSearchField();

      const pangoLineageSearchKey = getSearchValueThatLooksLikeAPangoLineage();

      await userEvent.type(getSearchTextField(), pangoLineageSearchKey);

      expect(screen.getByText(pangoLineageSearchKey)).toBeInTheDocument();
      expect(screen.getByText(pangoLineageSearchKey + '*')).toBeInTheDocument();
      expect(screen.getByText(pangoLineageSearchKey + ' (Nextclade)')).toBeInTheDocument();
      expect(screen.getByText(pangoLineageSearchKey + '* (Nextclade)')).toBeInTheDocument();
    });

    test('should display autocomplete pangoLineage suggestions for pangoLineage input', async () => {
      const pangoLineageSearchKey = getSearchValueThatLooksLikeAPangoLineage();

      const suggestedPangoLineage = pangoLineageSearchKey + 'SUGGESTION';
      fromApiMock.mockResolvedValue({ payload: [{ pangoLineage: suggestedPangoLineage }] });

      await renderVariantSearchField();

      await userEvent.type(getSearchTextField(), pangoLineageSearchKey);

      expect(screen.getByText(suggestedPangoLineage)).toBeInTheDocument();
    });

    test('should display autocomplete nextstrainClade suggestions for nexstrainClade input', async () => {
      const pangoLineageSearchKey = 'SOMEKEY';
      fetchAggSamplesMock.mockResolvedValue([{ nextstrainClade: pangoLineageSearchKey }]);

      await renderVariantSearchField();

      await userEvent.type(getSearchTextField(), pangoLineageSearchKey);

      expect(screen.getByText(pangoLineageSearchKey + ' (Nextstrain clade)')).toBeInTheDocument();
    });

    test('should trigger onVariantSelect callback when accepting suggestion', async () => {
      await renderVariantSearchField();

      await userEvent.type(getSearchTextField(), getSearchValueThatLooksLikeAPangoLineage() + '{enter}');

      expect(getSearchTextField()).toHaveValue('');
      expect(onVariantSelectMock).toHaveBeenCalledWith({
        aaInsertions: [],
        aaMutations: [],
        nextcladePangoLineage: 'A',
        nucInsertions: [],
        nucMutations: [],
      });
    });

    test('should trigger search when pressing enter after accepting suggestion', async () => {
      await renderVariantSearchField();

      await userEvent.type(getSearchTextField(), getSearchValueThatLooksLikeAPangoLineage() + '{enter}');
      await userEvent.type(getSearchTextField(), '{enter}');

      expect(triggerSearchMock).toHaveBeenCalled();
    });
  });

  describe('the advanced search field', () => {
    function getAdvancedSearchField() {
      return screen.getByRole('textbox');
    }

    function getAdvancedSearchCheckbobx() {
      return screen.getByRole('checkbox');
    }

    test('should be disabled by default', async () => {
      await renderVariantSearchField();

      expect(getAdvancedSearchCheckbobx()).not.toBeChecked();
    });

    test('should inherit the value from the simple search field when changing', async () => {
      await renderVariantSearchField();

      await userEvent.type(getSearchTextField(), 'user input');
      expect(getSearchTextField()).toHaveValue('user input');

      await userEvent.click(getAdvancedSearchCheckbobx());

      expect(getAdvancedSearchField()).toHaveValue('user input');
    });

    test('should trigger onVariantSelect callback when entering query', async () => {
      await renderVariantSearchField();
      await userEvent.click(getAdvancedSearchCheckbobx());

      await userEvent.type(getAdvancedSearchField(), 'my query');

      expect(getAdvancedSearchField()).toHaveValue('my query');
      expect(onVariantSelectMock).toHaveBeenCalledWith({ variantQuery: 'my query' });
    });

    test('should trigger search when pressing enter', async () => {
      await renderVariantSearchField();
      await userEvent.click(getAdvancedSearchCheckbobx());

      await userEvent.type(getAdvancedSearchField(), 'my query{enter}');

      expect(triggerSearchMock).toHaveBeenCalled();
    });
  });
});
