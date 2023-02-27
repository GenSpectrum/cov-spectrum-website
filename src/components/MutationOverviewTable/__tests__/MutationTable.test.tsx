import React from 'react';
import { act, render, screen, within } from '@testing-library/react';
import { BaselineMutationsTable, SingleMutationsTable } from '../MutationsTable';
import { LocationSelector } from '../../../data/LocationSelector';
import { MemoryRouter } from 'react-router-dom';
import { SpecialDateRangeSelector } from '../../../data/DateRangeSelector';
import { useBaselineMutationTableData, useMutationTableData } from '../hooks';
import userEvent from '@testing-library/user-event';
import { getLocationDisplay, LocationDisplay } from '../../../helpers/testing/LocationDisplay';

jest.mock('../../../data/api');
jest.mock('../../../data/api-lapis');

jest.mock('../hooks');
const useMutationTableDataMock = useMutationTableData as jest.Mock<ReturnType<typeof useMutationTableData>>;
const useBaselineMutationTableDataMock = useBaselineMutationTableData as jest.Mock<
  ReturnType<typeof useBaselineMutationTableData>
>;

beforeEach(() => {
  jest.resetAllMocks();
});

window.HTMLElement.prototype.scrollIntoView = jest.fn();

const dateRangeSelector = new SpecialDateRangeSelector('Past6M');
const mutationTypeAa = 'aa';
const locationSelector: LocationSelector = {
  region: undefined,
  country: 'United Kingdom',
  division: undefined,
};
const query = { nextcladePangoLineage: 'BF.7' };
const variants = [{ query, name: 'variant name', description: 'some description' }];
const baselineVariant = { pangoLineage: 'A.1.1' };

describe('SingleMutationsTable', () => {
  test('should render a loader when no data is present', () => {
    useMutationTableDataMock.mockReturnValue(undefined);

    render(
      <MemoryRouter>
        <SingleMutationsTable
          variants={variants}
          locationSelector={locationSelector}
          mutationType={mutationTypeAa}
          dateRangeSelector={dateRangeSelector}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  function createDataRows(numberOfRows: number) {
    return [...Array(numberOfRows)].map((_, j) => {
      const i = j + 1;
      return {
        name: `row ${i} name`,
        query,
        columns: [`row${i}-mutations1`, `row${i}-mutations2`, `row${i}-mutations3`, `row${i}-mutations4`],
      };
    });
  }

  test('should render the table with data when data is present', () => {
    useMutationTableDataMock.mockReturnValue(createDataRows(2));

    render(
      <MemoryRouter>
        <SingleMutationsTable
          variants={variants}
          locationSelector={locationSelector}
          mutationType={mutationTypeAa}
          dateRangeSelector={dateRangeSelector}
        />
      </MemoryRouter>
    );

    const rows = screen.getAllByText((_, element) => element?.tagName.toLowerCase() === 'tr');
    const cells = screen.getAllByText((_, element) => element?.tagName.toLowerCase() === 'td');

    const TWO_ROWS_PLUS_HEADER = 3;
    const THREE_ROWS_TIMES_5_COLUMNS = 15;

    expect(rows.length).toBe(TWO_ROWS_PLUS_HEADER);
    expect(cells.length).toBe(THREE_ROWS_TIMES_5_COLUMNS);
    expect(cells[6].textContent).toBe('row1-mutations1');
    expect(cells[8].textContent).toBe('row1-mutations3');
    expect(cells[14].textContent).toBe('row2-mutations4');

    expect(useMutationTableDataMock).toHaveBeenCalledWith(
      variants,
      locationSelector,
      dateRangeSelector,
      mutationTypeAa
    );
  });

  test('should link to the explore page when clicking the row name', async () => {
    useMutationTableDataMock.mockReturnValue(createDataRows(1));
    render(
      <MemoryRouter>
        <SingleMutationsTable
          variants={variants}
          locationSelector={locationSelector}
          mutationType={mutationTypeAa}
          dateRangeSelector={dateRangeSelector}
        />
        <LocationDisplay />
      </MemoryRouter>
    );

    await act(() => userEvent.click(screen.getByText('row 1 name')));

    expect(getLocationDisplay()).toHaveTextContent(
      '/explore/United%20Kingdom/AllSamples/Past6M/variants?nextcladePangoLineage=BF.7#mutations'
    );
  });
});

describe('BaselineMutationsTable', () => {
  function createDataRows(numberOfRows: number) {
    return [...Array(numberOfRows)]
      .map((_, i) => i + 1)
      .map(i => ({
        name: `row ${i} name`,
        query,
        additionalMutationColumns: [
          `row${i}-additional-mutations1`,
          `row${i}-additional-mutations2`,
          `row${i}-additional-mutations3`,
          `row${i}-additional-mutations4`,
        ],
        missingMutationColumns: [
          `row${i}-missing-mutations1`,
          `row${i}-missing-mutations2`,
          `row${i}-missing-mutations3`,
          `row${i}-missing-mutations4`,
        ],
      }));
  }

  test('should render a loader when no data is present', () => {
    useBaselineMutationTableDataMock.mockReturnValue(undefined);

    render(
      <MemoryRouter>
        <BaselineMutationsTable
          variants={variants}
          locationSelector={locationSelector}
          mutationType={mutationTypeAa}
          dateRangeSelector={dateRangeSelector}
          baselineVariant={{}}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('should render the table with data when data is present', () => {
    useBaselineMutationTableDataMock.mockReturnValue(createDataRows(2));

    render(
      <MemoryRouter>
        <BaselineMutationsTable
          variants={variants}
          locationSelector={locationSelector}
          mutationType={mutationTypeAa}
          dateRangeSelector={dateRangeSelector}
          baselineVariant={baselineVariant}
        />
      </MemoryRouter>
    );

    const table = screen.getByRole('table');

    const tableHeader = within(table).getAllByRole('rowgroup')[0];
    const headerCells = within(tableHeader).getAllByRole('cell');
    expectToMatchHeaderCells(headerCells, [
      '',
      'Additional',
      'Missing',
      'Name',
      '>90%',
      '60-90%',
      '30-60%',
      '5-30%',
      '>90%',
      '60-90%',
      '30-60%',
      '5-30%',
    ]);

    const tableBody = within(table).getAllByRole('rowgroup')[1];
    const bodyCells = within(tableBody).getAllByRole('cell');

    expect(bodyCells).toHaveLength(18);
    expect(bodyCells[0]).toHaveTextContent('row 1 name');
    expect(bodyCells[1]).toHaveTextContent('row1-additional-mutations1');
    expect(bodyCells[7]).toHaveTextContent('row1-missing-mutations3');
    expect(bodyCells[11]).toHaveTextContent('row2-additional-mutations2');
    expect(bodyCells[17]).toHaveTextContent('row2-missing-mutations4');

    expect(useBaselineMutationTableDataMock).toHaveBeenCalledWith(
      variants,
      locationSelector,
      dateRangeSelector,
      baselineVariant,
      mutationTypeAa
    );
  });

  function expectToMatchHeaderCells(headerCells: HTMLElement[], headerNames: string[]) {
    expect(headerCells).toHaveLength(headerNames.length);
    headerNames.forEach((headerName, i) => expect(headerCells[i]).toHaveTextContent(headerName));
  }

  test('should link to the explore page when clicking the row name', async () => {
    useBaselineMutationTableDataMock.mockReturnValue(createDataRows(1));
    render(
      <MemoryRouter>
        <BaselineMutationsTable
          variants={variants}
          locationSelector={locationSelector}
          mutationType={mutationTypeAa}
          dateRangeSelector={dateRangeSelector}
          baselineVariant={baselineVariant}
        />
        <LocationDisplay />
      </MemoryRouter>
    );

    await act(() => userEvent.click(screen.getByText('row 1 name')));

    expect(getLocationDisplay()).toHaveTextContent(
      '/explore/United%20Kingdom/AllSamples/Past6M/variants?nextcladePangoLineage=BF.7&analysisMode=CompareEquals&'
    );
  });
});
