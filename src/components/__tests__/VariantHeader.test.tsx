import { render, screen } from '@testing-library/react';
import { VariantHeader } from '../VariantHeader';
import { PangoLineageAliasResolverService } from '../../services/PangoLineageAliasResolverService';

const findFullNameMock = jest.fn();

PangoLineageAliasResolverService.findFullName = findFullNameMock;

describe('VariantHeader', () => {
  beforeEach(() => {
    findFullNameMock.mockReset();
  });

  test('should display variant name without alias', () => {
    findFullNameMock.mockResolvedValueOnce(undefined);

    render(<VariantHeader variant={{ pangoLineage: 'pango lineage' }} />);

    expect(screen.getByText('PANGO LINEAGE')).toBeInTheDocument();
    expect(screen.queryByText('Alias')).not.toBeInTheDocument();
  });

  test('should display the title suffix', () => {
    findFullNameMock.mockResolvedValueOnce(undefined);

    render(<VariantHeader variant={{ pangoLineage: 'pango lineage' }} titleSuffix={<>title suffix</>} />);

    expect(screen.getByText('PANGO LINEAGE - title suffix')).toBeInTheDocument();
  });

  test('should display the controls', () => {
    findFullNameMock.mockResolvedValueOnce(undefined);

    render(<VariantHeader variant={{ pangoLineage: 'pango lineage' }} controls={<>some controls</>} />);

    expect(screen.getByText('some controls')).toBeInTheDocument();
  });

  test('should display variant alias', async () => {
    findFullNameMock.mockResolvedValueOnce('"variant alias"');

    render(<VariantHeader variant={{ pangoLineage: 'pango lineage' }} controls={<>some controls</>} />);

    expect(await screen.findByText('Alias for "variant alias"')).toBeInTheDocument();
    expect(findFullNameMock).toHaveBeenCalledWith('pango lineage');
  });
});
