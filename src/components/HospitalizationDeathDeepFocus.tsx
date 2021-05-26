import React, { useState } from 'react';
import { Alert, Button } from 'react-bootstrap';
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

const Toolbar = styled.div`
  margin: 15px;
`;

const Info = styled.div`
  margin: 15px;
`;

export const HospitalizationDeathDeepFocus = ({
  country,
  variantSampleSet,
  wholeSampleSet,
  variantName,
}: Props) => {
  const [relative, setRelative] = useState(false);

  if (country !== 'Switzerland') {
    return <Alert variant='danger'>Hospitalization and death rates are only available for Switzerland</Alert>;
  }

  return (
    <>
      <PackedGrid maxColumns={2}>
        <GridCell minWidth={800}>
          <NamedCard title='Hospitalization'>
            <HospitalizationDeathPlot
              field='hospitalized'
              variantSampleSet={variantSampleSet}
              wholeSampleSet={wholeSampleSet}
              variantName={variantName}
              extendedMetrics
              relativeToOtherVariants={relative}
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
              relativeToOtherVariants={relative}
            />
          </NamedCard>
        </GridCell>
      </PackedGrid>

      <Toolbar>
        <Button variant='secondary' onClick={() => setRelative(v => !v)}>
          Show {relative ? 'absolute' : 'relative'} data
        </Button>
      </Toolbar>

      <Info>
        <p>
          These plots show the rates of hospitalization and death reported in connection with SARS-CoV-2
          samples.{' '}
          {relative && (
            <>
              The Y value represents the probability of hospitalization/death in connection with {variantName}{' '}
              samples, relative to the probability in connection with samples from other variants. It is
              calculated as (rate {variantName}) / (rate for other variants).
            </>
          )}
        </p>
        <p>The following samples are omitted from the plots:</p>
        <ul>
          <li>Samples from the last {OMIT_LAST_N_WEEKS} weeks</li>
          <li>Samples for which no hospitalization or death outcome is known</li>
        </ul>
        {relative ? (
          <p>
            The error bars show 95% confidence intervals where the data is modeled as the ratio of two
            binomial proportions. These intervals are approximated using the method from "Obtaining Confidence
            Intervals for the Risk Ratio in Cohort Studies" (Katz et al., 1978, Biometrics 34, 469-474). Some
            very wide error bars may be cut off.
          </p>
        ) : (
          <p>
            The error bars show Wilson score intervals with 95% confidence assuming that the measured outcomes
            are binomially distributed.
          </p>
        )}
      </Info>
    </>
  );
};
