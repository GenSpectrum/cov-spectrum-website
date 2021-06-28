import React, { useMemo, useState } from 'react';
import { SampleSet, SampleSetWithSelector } from '../helpers/sample-set';
import { GridCell, PackedGrid } from './PackedGrid';
import { AlmostFullscreenModal } from './AlmostFullscreenModal';
import { mapParsedMultiSample } from '../helpers/switzerland-regions';

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

const splitByDivision = (variantSampleSet: SampleSetWithSelector, wholeSampleSet: SampleSetWithSelector) => {
  const divisionVariantSampleSetMap = variantSampleSet.groupByField('division');
  const divisionWholeSampleSetMap = wholeSampleSet.groupByField('division');
  return [...divisionVariantSampleSetMap.keys()]
    .filter(division => !!division)
    .sort()
    .map(division => ({
      division: division!,
      variantSampleSet: new SampleSet(
        divisionVariantSampleSetMap.get(division)!,
        variantSampleSet.sampleSelector
      ),
      wholeSampleSet: new SampleSet(
        divisionWholeSampleSetMap.get(division)!,
        wholeSampleSet.sampleSelector
      ),
    }));
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
    return splitByDivision(variantSampleSet, wholeSampleSet);
  }, [variantSampleSet, wholeSampleSet]);

  // Special case for Switzerland: We provide an additional view for CH and group cantons to larger regions.
  const isSwitzerland = wholeSampleSet.sampleSelector.country === 'Switzerland';
  const [showSwissRegions, setShowSwissRegions] = useState(isSwitzerland);
  const switzerlandRegionData = useMemo(() => {
    if (!isSwitzerland) {
      return undefined;
    }
    const mappedVariantSampleSet = new SampleSet(
      mapParsedMultiSample([...variantSampleSet.getAll()]),
      variantSampleSet.sampleSelector
    );
    const mappedWholeSampleSet = new SampleSet(
      mapParsedMultiSample([...wholeSampleSet.getAll()]),
      wholeSampleSet.sampleSelector
    );
    return splitByDivision(mappedVariantSampleSet, mappedWholeSampleSet);
  }, [isSwitzerland, variantSampleSet, wholeSampleSet]);

  return (
    <AlmostFullscreenModal show={show} handleClose={handleClose} header={header}>
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
    </AlmostFullscreenModal>
  );
};
