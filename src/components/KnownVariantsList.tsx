import { Button, Table } from 'react-bootstrap';
import { Country, Variant, Selection } from '../services/api-types';
import knownVariants from './known-variants.json';

export interface SelectedVariantAndCountry {
  variant: Variant;
  country?: Country;
}

interface Props {
  country: Country;
  onVariantSelect: (selection: Selection) => void;
  selection: Selection | undefined;
}

export const KnownVariantsList = ({ country, onVariantSelect, selection }: Props) => {
  const _knownVariants: Selection[] = knownVariants;

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Variant</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {_knownVariants.map(d => (
          <tr key={d.variant.name}>
            {selection !== undefined && selection.variant.name === d.variant.name ? (
              <>
                <td>
                  <b>{d.variant.name}</b>
                </td>
                <td></td>
              </>
            ) : (
              <>
                <td>{d.variant.name}</td>
                <td>
                  <Button
                    onClick={() => {
                      onVariantSelect(d);
                    }}
                    variant='outline-secondary'
                    size='sm'
                  >
                    Show Details
                  </Button>
                </td>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
