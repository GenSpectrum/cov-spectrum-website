import Loader from '../Loader';
import React, { useState } from 'react';
import Table from 'react-bootstrap/Table';
import { formatVariantDisplayName } from '../../data/VariantSelector';
import { sortAAMutationList } from '../../helpers/aa-mutation';
import { LapisSelector } from '../../data/LapisSelector';
import { PercentageValueWithOverlaySlider } from '../PercentageValueWithOverlaySlider';
import { Tooltip, tooltipClasses, TooltipProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useOverlappingData } from './VariantMutationComparisonHook';

export interface Props {
  selectors: LapisSelector[];
}

export const VariantMutationComparison = ({ selectors }: Props) => {
  const [minProportion, setMinProportion] = useState(0.5);

  const overlappingData = useOverlappingData(selectors, minProportion);
  if (overlappingData === 'loading' || !overlappingData) {
    return <Loader />;
  }

  return (
    <>
      <div>
        A mutation is considered as belonging to a variant if at least{' '}
        <PercentageValueWithOverlaySlider
          percentageValue={minProportion}
          setPercentageValue={setMinProportion}
        />{' '}
        of the samples of the variant have the mutation.
      </div>

      <div>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Gene</th>
              <th>Only {formatVariantDisplayName(selectors[0].variant!)}</th>
              <th>Shared</th>
              <th>Only {formatVariantDisplayName(selectors[1].variant!)}</th>
            </tr>
          </thead>
          <tbody>
            {overlappingData.map(({ gene, mutationsOnlyIn1, mutationsOnlyIn2, sharedMutations }) => (
              <tr key={gene}>
                <td>{gene}</td>
                <td>
                  <VariantTableEntryWithTooltip mutations={mutationsOnlyIn1} />
                </td>
                <td>
                  <VariantTableEntryWithTooltip mutations={sharedMutations} />
                </td>
                <td>
                  <VariantTableEntryWithTooltip mutations={mutationsOnlyIn2} />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </>
  );
};

function VariantTableEntryWithTooltip({ mutations }: { mutations: string[] }) {
  if (mutations.length === 0) {
    return <>{mutations.length}</>;
  }
  return (
    <CustomWidthTooltip title={sortAAMutationList(mutations).join(', ')} followCursor>
      <div>{mutations.length}</div>
    </CustomWidthTooltip>
  );
}

const CustomWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 300,
  },
});
