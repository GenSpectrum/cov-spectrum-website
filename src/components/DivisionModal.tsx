import React, { useMemo, useState } from 'react';
import { ParsedMultiSample, SampleSet, SampleSetWithSelector } from '../helpers/sample-set';
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

const switzerlandRegions = [
  {
    name: 'Region 1 (GE, NE, VD, VS)',
    divisions: ['Geneva', 'Neuchâtel', 'Vaud', 'Valais'],
  },
  {
    name: 'Region 2 (BE, FR, JU)',
    divisions: ['Bern', 'Fribourg', 'Jura'],
  },
  {
    name: 'Region 3 (AG, BL, BS, SO)',
    divisions: ['Aargau', 'Basel-Land', 'Basel-Stadt', 'Solothurn'],
  },
  {
    name: 'Region 4 (LU, NW, OW, SZ, UR, ZG)',
    divisions: ['Lucerne', 'Nidwalden', 'Obwalden', 'Schwyz', 'Uri', 'Zug'],
  },
  {
    name: 'Region 5 (AI, AR, GL, SG, SH, TG, ZH)',
    divisions: [
      'Zürich',
      'Schaffhausen',
      'Thurgau',
      'Sankt Gallen',
      'Appenzell Innerhoden',
      'Appenzell Ausserhoden',
    ],
  },
  {
    name: 'Region 6 (GR, TI)',
    divisions: ['Graubünden', 'Ticino'],
  },
];

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
    return [...divisions]
      .filter(d => !!d)
      .sort()
      .map(division => ({
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

  // Special case for Switzerland: We provide an additional view for CH and group cantons to larger regions.
  const isSwitzerland = wholeSampleSet.sampleSelector.country === 'Switzerland';
  const [showSwissRegions, setShowSwissRegions] = useState(isSwitzerland);
  const switzerlandRegionData = useMemo(() => {
    if (!isSwitzerland) {
      return undefined;
    }
    const divisionToRegion = new Map<string, string>();
    const regionToVariantSampleSet = new Map<string, ParsedMultiSample[]>();
    const regionToWholeSampleSet = new Map<string, ParsedMultiSample[]>();
    for (let { divisions, name } of switzerlandRegions) {
      for (let division of divisions) {
        divisionToRegion.set(division, name);
      }
      regionToVariantSampleSet.set(name, []);
      regionToWholeSampleSet.set(name, []);
    }
    for (let d of data) {
      if (!divisionToRegion.has(d.division)) {
        continue;
      }
      regionToVariantSampleSet.get(divisionToRegion.get(d.division)!)!.push(...d.variantSampleSet.getAll());
      regionToWholeSampleSet.get(divisionToRegion.get(d.division)!)!.push(...d.wholeSampleSet.getAll());
    }
    return switzerlandRegions.map(({ name }) => ({
      variantSampleSet: new SampleSet(regionToVariantSampleSet.get(name)!, variantSampleSet.sampleSelector),
      wholeSampleSet: new SampleSet(regionToWholeSampleSet.get(name)!, wholeSampleSet.sampleSelector),
      division: name,
    }));
  }, [data, isSwitzerland, variantSampleSet.sampleSelector, wholeSampleSet.sampleSelector]);

  return (
    <>
      <Modal show={show} onHide={handleClose} dialogClassName='w-11/12 max-w-full'>
        <Modal.Header closeButton>
          <Modal.Title>{header}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isSwitzerland && (
            <div className='ml-4'>
              <span
                className={showSwissRegions ? 'font-bold' : 'underline cursor-pointer'}
                onClick={() => setShowSwissRegions(true)}
              >
                Show regions
              </span>{' '}
              |{' '}
              <span
                className={!showSwissRegions ? 'font-bold' : 'underline cursor-pointer'}
                onClick={() => setShowSwissRegions(false)}
              >
                Show cantons
              </span>
            </div>
          )}
          <PackedGrid maxColumns={3}>
            {(showSwissRegions ? switzerlandRegionData : data)?.map(d => {
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
