import React, { useMemo } from 'react';
import { GridCell, PackedGrid } from './PackedGrid';
import { AlmostFullscreenModal } from './AlmostFullscreenModal';
import { useQuery } from '../helpers/query-hook';
import Loader from './Loader';

type Props<D, T> = {
  getData: (signal: AbortSignal) => Promise<D>;
  splitData: (data: D) => { division: string; data: T }[];
  generate: (division: string, data: T) => React.ReactElement;
  // Special case for Switzerland: We provide an additional view for CH and group cantons to larger regions.
  show: boolean;
  handleClose: () => void;
  header: string;
};

export const DivisionModal = <D, T>({
  getData,
  splitData,
  generate,
  show,
  handleClose,
  header,
}: Props<D, T>) => {
  const data = useQuery(getData, [getData]);
  const split = useMemo(() => data.data && splitData(data.data), [data, splitData]);

  return split ? (
    <AlmostFullscreenModal show={show} handleClose={handleClose} header={header}>
      <PackedGrid maxColumns={3}>
        {split.map(({ division, data }) => {
          return (
            <GridCell minWidth={600} key={division}>
              {generate(division, data)}
            </GridCell>
          );
        })}
      </PackedGrid>
    </AlmostFullscreenModal>
  ) : (
    <Loader />
  );
};
