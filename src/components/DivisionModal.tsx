import React from 'react';
import { GridCell, PackedGrid } from './PackedGrid';
import { AlmostFullscreenModal } from './AlmostFullscreenModal';

type Props<D> = {
  generate: (division: string, data: D) => React.ReactElement;
  data: Map<string, D>; // division ->data
  // Special case for Switzerland: We provide an additional view for CH and group cantons to larger regions.
  show: boolean;
  handleClose: () => void;
  header: string;
};

export const DivisionModal = <D,>({ generate, data, show, handleClose, header }: Props<D>) => {
  return (
    <AlmostFullscreenModal show={show} handleClose={handleClose} header={header}>
      <PackedGrid maxColumns={3}>
        {[...data.entries()]
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([division, dataset]) => {
            return (
              <GridCell minWidth={600} key={division}>
                {generate(division, dataset)}
              </GridCell>
            );
          })}
      </PackedGrid>
    </AlmostFullscreenModal>
  );
};
