import React, { useMemo } from 'react';
import { SampleSet, SampleSetWithSelector } from '../helpers/sample-set';
import { GridCell } from './PackedGrid/GridCell';
import { PackedGrid } from './PackedGrid/PackedGrid';
import { Modal } from 'react-bootstrap';

type Props = {
  generate: (
    division: string,
    variantSampleSet: SampleSetWithSelector,
    wholeSampleSet: SampleSetWithSelector
  ) => React.ReactElement;
  variantSampleSet: SampleSetWithSelector;
  wholeSampleSet: SampleSetWithSelector;
  show: boolean;
  handleClose: () => void;
  header: string;
};

export const DivisionModal = ({
  generate,
  variantSampleSet,
  wholeSampleSet,
  show,
  handleClose,
  header,
}: Props) => {
  const data = useMemo(() => {
    const divisions = new Set<string>();
    for (const el of variantSampleSet.getAll()) {
      const division = el.division;
      if (division !== null) {
        divisions.add(division);
      }
    }
    return [...divisions].sort().map(division => ({
      variantSampleSet: new SampleSet(
        [...variantSampleSet.getAll()].filter(x => x.division === division),
        variantSampleSet.sampleSelector
      ),
      wholeSampleSet: new SampleSet(
        [...wholeSampleSet.getAll()].filter(x => x.division === division),
        variantSampleSet.sampleSelector
      ),
      division,
    }));
  }, [variantSampleSet, wholeSampleSet]);

  return (
    <>
      <Modal show={show} onHide={handleClose} dialogClassName='w-11/12 max-w-full'>
        <Modal.Header closeButton>
          <Modal.Title>{header}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PackedGrid maxColumns={3}>
            {data.map(d => {
              return (
                <GridCell minWidth={600} key={d.division}>
                  {generate(d.division, d.variantSampleSet, d.wholeSampleSet)}
                </GridCell>
              );
            })}
          </PackedGrid>
        </Modal.Body>
      </Modal>
    </>
  );
};
