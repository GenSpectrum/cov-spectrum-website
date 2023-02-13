import { VariantSearchField } from '../VariantSearchField';
import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { DndProvider } from 'react-dnd';
import { TestBackend } from 'react-dnd-test-backend';
import userEvent from '@testing-library/user-event';
import { PangoCountSampleData } from '../../data/sample/PangoCountSampleDataset';
import { _fetchAggSamples } from '../../data/api-lapis';
import { isValidPangoLineageQuery } from '../../data/VariantSelector';

function getSearchTextField() {
  return screen.getByRole('combobox');
}

async function renderVariantSearchField() {
  await act(() => {
    render(
      <DndProvider backend={TestBackend}>
        <VariantSearchField onVariantSelect={() => {}} triggerSearch={() => {}} />
      </DndProvider>
    );
  });
}

jest.mock('../../data/sample/PangoCountSampleDataset');
const fromApiMock = jest.fn();
PangoCountSampleData.fromApi = fromApiMock;

jest.mock('../../data/api-lapis');
const _fetchAggSamplesMock = _fetchAggSamples as jest.Mock;

describe('VariantSearchField', () => {
  beforeEach(() => {
    fromApiMock.mockReset();
    fromApiMock.mockResolvedValue({ payload: [] });

    _fetchAggSamplesMock.mockReset();
    _fetchAggSamplesMock.mockResolvedValue([]);
  });

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

    const pangoLineageSearchKey = 'A';
    expect(isValidPangoLineageQuery(pangoLineageSearchKey)).toBe(true);

    await userEvent.type(getSearchTextField(), pangoLineageSearchKey);

    expect(screen.getByText(pangoLineageSearchKey)).toBeInTheDocument();
    expect(screen.getByText(pangoLineageSearchKey + '*')).toBeInTheDocument();
    expect(screen.getByText(pangoLineageSearchKey + ' (Nextclade)')).toBeInTheDocument();
    expect(screen.getByText(pangoLineageSearchKey + '* (Nextclade)')).toBeInTheDocument();
  });

  test('should display autocomplete pangoLineage suggestions for pangoLineage input', async () => {
    const pangoLineageSearchKey = 'A';
    expect(isValidPangoLineageQuery(pangoLineageSearchKey)).toBe(true);

    const suggestedPangoLineage = pangoLineageSearchKey + 'SUGGESTION';
    fromApiMock.mockResolvedValue({ payload: [{ pangoLineage: suggestedPangoLineage }] });

    await renderVariantSearchField();

    await userEvent.type(getSearchTextField(), pangoLineageSearchKey);

    expect(screen.getByText(suggestedPangoLineage)).toBeInTheDocument();
  });

  test('should display autocomplete nextstrainClade suggestions for nexstrainClade input', async () => {
    const pangoLineageSearchKey = 'SOMEKEY';
    _fetchAggSamplesMock.mockResolvedValue([{ nextstrainClade: pangoLineageSearchKey }]);

    await renderVariantSearchField();

    await userEvent.type(getSearchTextField(), pangoLineageSearchKey);

    expect(screen.getByText(pangoLineageSearchKey + ' (Nextstrain clade)')).toBeInTheDocument();
  });
});
