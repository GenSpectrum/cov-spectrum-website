import { useOverlappingData } from '../VariantMutationComparisonHook';
import ResizeObserver from 'resize-observer-polyfill';
import { render, screen, within } from '@testing-library/react';
import { VariantMutationComparison } from '../VariantMutationComparison';
import { defaultSubmissionDateRangeSelector } from '../../../data/DateRangeSelector';
import { SamplingStrategy } from '../../../data/SamplingStrategy';
import React from 'react';
import { formatVariantDisplayName } from '../../../data/VariantSelector';
import userEvent from '@testing-library/user-event';

jest.mock('../../../data/api');

jest.mock('../VariantMutationComparisonHook');
const useOverlappingDataMock = useOverlappingData as jest.Mock;

jest.mock('../../../data/VariantSelector');
const formatVariantDisplayNameMock = formatVariantDisplayName as jest.Mock;

window.ResizeObserver = ResizeObserver;
jest.mock('react-resize-detector');

describe('VariantMutationComparison', () => {
  beforeEach(() => {
    useOverlappingDataMock.mockReset();
    formatVariantDisplayNameMock.mockReset();
  });

  function renderVariantTable(
    mutationsOnGenes: {
      mutationsOnlyIn1: string[];
      mutationsOnlyIn2: any[];
      gene: string;
      sharedMutations: string[];
    }[],
    comparedVariantDisplayNames: string[]
  ) {
    useOverlappingDataMock.mockReturnValue(mutationsOnGenes);

    comparedVariantDisplayNames.forEach(name => {
      formatVariantDisplayNameMock.mockReturnValueOnce(name);
    });

    render(
      <VariantMutationComparison
        selectors={comparedVariantDisplayNames.map(name => ({
          location: {},
          qc: {},
          host: undefined,
          variant: { pangoLineage: name },
          dateRange: undefined,
          submissionDate: defaultSubmissionDateRangeSelector,
          samplingStrategy: SamplingStrategy.AllSamples,
        }))}
      />
    );
  }

  test('should show loader if data is not available', () => {
    useOverlappingDataMock.mockReturnValue('loading');

    render(<VariantMutationComparison selectors={[]} />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('should show initial percentage without tooltip', () => {
    const mutationOnGene = {
      mutationsOnlyIn1: [],
      mutationsOnlyIn2: [],
      sharedMutations: [],
      gene: 'E',
    };

    renderVariantTable([mutationOnGene], ['SOMEVARIANT', 'OTHERVARIANT']);

    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  test('should show percentage slider on click', async () => {
    const mutationOnGene = {
      mutationsOnlyIn1: [],
      mutationsOnlyIn2: [],
      sharedMutations: [],
      gene: 'E',
    };
    renderVariantTable([mutationOnGene], ['SOMEVARIANT', 'OTHERVARIANT']);

    await userEvent.click(screen.getByText('50%'), { delay: 500 });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  test('should show table of mutations', () => {
    const mutationOnGene1 = {
      mutationsOnlyIn1: ['E:ABC', 'E:DEF'],
      mutationsOnlyIn2: [],
      sharedMutations: ['E:GHI'],
      gene: 'E',
    };

    const mutationOnGene2 = {
      mutationsOnlyIn1: ['N:ABC'],
      mutationsOnlyIn2: ['N:DEF'],
      sharedMutations: ['N:GHI'],
      gene: 'N',
    };
    renderVariantTable([mutationOnGene1, mutationOnGene2], ['SOMEVARIANT', 'OTHERVARIANT']);

    const columns = ['Gene', 'Only SOMEVARIANT', 'Shared', 'Only OTHERVARIANT'];
    const headerCells = screen.getAllByRole('columnheader');
    headerCells.forEach((headerCell, index) => {
      expect(within(headerCell).getByText(columns[index])).toBeInTheDocument();
    });

    const expectedMutationRow1 = [
      mutationOnGene1.gene,
      mutationOnGene1.mutationsOnlyIn1.length,
      mutationOnGene1.sharedMutations.length,
      mutationOnGene1.mutationsOnlyIn2.length,
    ];

    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(3);

    const firstRowCells = within(rows[1]).getAllByRole('cell');
    firstRowCells.forEach((cell, index) => {
      expect(within(cell).getByText(expectedMutationRow1[index])).toBeInTheDocument();
    });

    const expectedMutationRow2 = [
      mutationOnGene2.gene,
      mutationOnGene2.mutationsOnlyIn1.length,
      mutationOnGene2.sharedMutations.length,
      mutationOnGene2.mutationsOnlyIn2.length,
    ];

    const secondRowCells = within(rows[2]).getAllByRole('cell');
    secondRowCells.forEach((cell, index) => {
      expect(within(cell).getByText(expectedMutationRow2[index])).toBeInTheDocument();
    });
  });

  test('should show tooltip if the user hovers over cell with non zero value', async () => {
    const mutationOnGene = {
      mutationsOnlyIn1: ['E:ABC', 'E:DEF'],
      mutationsOnlyIn2: [],
      sharedMutations: ['E:GHI'],
      gene: 'E',
    };

    renderVariantTable([mutationOnGene], ['SOMEVARIANT', 'OTHERVARIANT']);

    const cellWithVariants = within(screen.getAllByRole('row')[1]).getByText('2');

    await userEvent.hover(cellWithVariants, { delay: 500 });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByRole('tooltip')).toHaveTextContent(mutationOnGene.mutationsOnlyIn1.join(', '));
  });

  test('should show no tooltip if the user hovers over cell with zero value', async () => {
    const mutationOnGene = {
      mutationsOnlyIn1: ['E:ABC', 'E:DEF'],
      mutationsOnlyIn2: [],
      sharedMutations: ['E:GHI'],
      gene: 'E',
    };

    renderVariantTable([mutationOnGene], ['SOMEVARIANT', 'OTHERVARIANT']);

    const cellWithVariants = within(screen.getAllByRole('row')[1]).getByText('0');
    await userEvent.hover(cellWithVariants, { delay: 500 });

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });
});
