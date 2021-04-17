import React from 'react';
import { Alert } from 'react-bootstrap';
import { SampleSetWithSelector } from '../helpers/sample-set';
import { AccountService } from '../services/AccountService';
import { Country } from '../services/api-types';
import { HospitalizationDeathPlot } from '../widgets/HospitalizationDeathPlot';
import { NamedCard } from './NamedCard';
import { GridCell, PackedGrid } from './PackedGrid';

interface Props {
  country: Country;
  variantSampleSet: SampleSetWithSelector;
  wholeSampleSet: SampleSetWithSelector;
  variantName: string;
}

export const HospitalizationDeathDeepFocus = ({
  country,
  variantSampleSet,
  wholeSampleSet,
  variantName,
}: Props) => {
  const loggedIn = AccountService.isLoggedIn();
  if (!loggedIn) {
    return <Alert variant='danger'>You must log in to view hospitalization and death rates</Alert>;
  }

  if (country !== 'Switzerland') {
    return <Alert variant='danger'>Hospitalization and death rates are only available for Switzerland</Alert>;
  }

  return (
    <PackedGrid maxColumns={2}>
      <GridCell minWidth={800}>
        <NamedCard title='Hospitalization rate'>
          <HospitalizationDeathPlot
            field='hospitalized'
            variantSampleSet={variantSampleSet}
            wholeSampleSet={wholeSampleSet}
            variantName={variantName}
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
            variantName={variantName}
            extendedMetrics
          />
        </NamedCard>
      </GridCell>
    </PackedGrid>
  );
};
