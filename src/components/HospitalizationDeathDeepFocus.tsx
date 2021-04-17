import React from 'react';
import { SampleSetWithSelector } from '../helpers/sample-set';
import { HospitalizationDeathPlot } from '../widgets/HospitalizationDeathPlot';
import { NamedCard } from './NamedCard';
import { GridCell, PackedGrid } from './PackedGrid';

interface Props {
  variantSampleSet: SampleSetWithSelector;
  wholeSampleSet: SampleSetWithSelector;
}

export const HospitalizationDeathDeepFocus = ({ variantSampleSet, wholeSampleSet }: Props) => {
  return (
    <PackedGrid maxColumns={2}>
      <GridCell minWidth={800}>
        <NamedCard title='Hospitalization rate'>
          <HospitalizationDeathPlot
            field='hospitalized'
            variantSampleSet={variantSampleSet}
            wholeSampleSet={wholeSampleSet}
            extendedMetrics
          />
        </NamedCard>
      </GridCell>
      <GridCell minWidth={800}>
        <NamedCard title='Death rate'>
          <HospitalizationDeathPlot
            field='deceased'
            variantSampleSet={variantSampleSet}
            wholeSampleSet={wholeSampleSet}
            extendedMetrics
          />
        </NamedCard>
      </GridCell>
    </PackedGrid>
  );
};
