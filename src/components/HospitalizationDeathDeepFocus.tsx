import React from 'react';
import { Alert } from 'react-bootstrap';
import styled from 'styled-components';
import { SampleSetWithSelector } from '../helpers/sample-set';
import { Country } from '../services/api-types';
import { HospitalizationDeathPlot, OMIT_LAST_N_WEEKS } from '../widgets/HospitalizationDeathPlot';
import { NamedCard } from './NamedCard';
import { GridCell, PackedGrid } from './PackedGrid';

interface Props {
  country: Country;
  variantSampleSet: SampleSetWithSelector;
  wholeSampleSet: SampleSetWithSelector;
  variantName: string;
}

const Info = styled.div`
  margin: 15px;
`;

export const HospitalizationDeathDeepFocus = ({
  country,
  variantSampleSet,
  wholeSampleSet,
  variantName,
}: Props) => {
  if (country !== 'Switzerland') {
    return <Alert variant='danger'>Hospitalization and death rates are only available for Switzerland</Alert>;
  }

  return (
    <>
      <PackedGrid maxColumns={2}>
        <GridCell minWidth={800}>
          <NamedCard title='Hospitalization probabilities'>
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
          <NamedCard title='Death probabilities'>
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

      <Info>
        <p>
          These plots show the rates of hospitalization and death reported in connection with SARS-CoV-2
          samples.
        </p>
        <p>The following samples are omitted from the plots:</p>
        <ul>
          <li>Samples from the last {OMIT_LAST_N_WEEKS} weeks</li>
          <li>Samples for which no hospitalization or death outcome is known</li>
        </ul>
        <p>
          The error bars show Wilson score intervals with 95% confidence assuming that the measured outcomes
          are binomially distributed.
        </p>
      </Info>
    </>
  );
};
