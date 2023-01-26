import { render, screen } from '@testing-library/react';
import { VariantHeader } from '../VariantHeader';
import { useQuery } from '../../helpers/query-hook';
import { usePangoLineageFullName } from '../../services/pangoLineageAlias';

jest.mock('../../services/pangoLineageAlias');
const usePangoLineageFullNameMock = usePangoLineageFullName as jest.Mock;

jest.mock('../../helpers/query-hook');
const useQueryMock = useQuery as jest.Mock;

describe('VariantHeader', () => {
  beforeEach(() => {
    usePangoLineageFullNameMock.mockReset();
    usePangoLineageFullNameMock.mockReturnValue(undefined);

    useQueryMock.mockReset();
    useQueryMock.mockReturnValue({ data: undefined });
  });

  test('should display variant name without alias', () => {
    render(<VariantHeader variant={{ pangoLineage: 'pango lineage' }} />);

    expect(screen.getByText('PANGO LINEAGE')).toBeInTheDocument();
    expect(screen.queryByText('Alias')).not.toBeInTheDocument();
  });

  test('should display the title suffix', () => {
    render(<VariantHeader variant={{ pangoLineage: 'pango lineage' }} titleSuffix={<>title suffix</>} />);

    expect(screen.getByText('PANGO LINEAGE - title suffix')).toBeInTheDocument();
  });

  test('should display the controls', () => {
    render(<VariantHeader variant={{ pangoLineage: 'pango lineage' }} controls={<>some controls</>} />);

    expect(screen.getByText('some controls')).toBeInTheDocument();
  });

  test('should display variant alias', async () => {
    usePangoLineageFullNameMock.mockReturnValue('FULLNAME.1.2');

    render(<VariantHeader variant={{ pangoLineage: 'SOMEALIAS' }} />);

    expect(await screen.findByText('Alias for FULLNAME.1.2')).toBeInTheDocument();
    expect(usePangoLineageFullNameMock).toHaveBeenCalledWith('SOMEALIAS');
  });

  test.each([['XAA'], ['XAA*']])('should display recombination alias for %s', async pangoLineage => {
    useQueryMock.mockReturnValue({
      data: [
        {
          name: 'XAA',
          parents: ['BA.1*', 'BA.2*', 'BA.1*'],
        },
      ],
    });

    render(<VariantHeader variant={{ pangoLineage }} />);

    expect(await screen.findByText('Recombinant of BA.1*, BA.2*')).toBeInTheDocument();
  });

  test('should display recombinant alias of child of recombinant', async () => {
    useQueryMock.mockReturnValue({
      data: [
        {
          name: 'XAA',
          parents: ['BA.1*', 'BA.2*', 'BA.1*'],
        },
      ],
    });

    render(<VariantHeader variant={{ pangoLineage: 'XAA.1.5' }} />);

    expect(await screen.findByText('Child of recombinant of BA.1*, BA.2*')).toBeInTheDocument();
  });
});
