import { mapValues } from 'lodash';
import React, { useMemo } from 'react';
import { AsyncState } from 'react-async';
import { Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AsyncVariantInternationalComparisonPlot } from '../components/AsyncVariantInternationalComparisonPlot';
import { FocusVariantHeaderControls } from '../components/FocusVariantHeaderControls';
import { NamedCard } from '../components/NamedCard';
import { GridCell, PackedGrid } from '../components/PackedGrid';
import Switzerland from '../components/Switzerland';
import { VariantHeader } from '../components/VariantHeader';
import { getFocusPageLink } from '../helpers/explore-url';
import { SampleSetWithSelector } from '../helpers/sample-set';
import { Chen2021FitnessPreview } from '../models/chen2021Fitness/Chen2021FitnessPreview';
import { AccountService } from '../services/AccountService';
import { SamplingStrategy, toLiteralSamplingStrategy } from '../services/api';
import { Country, Variant } from '../services/api-types';
import { HospitalizationDeathPlot } from '../widgets/HospitalizationDeathPlot';
import { VariantAgeDistributionPlotWidget } from '../widgets/VariantAgeDistributionPlot';
import { VariantTimeDistributionPlotWidget } from '../widgets/VariantTimeDistributionPlot';

interface Props {
  country: Country;
  matchPercentage: number;
  variant: Variant;
  samplingStrategy: SamplingStrategy;
  variantSampleSet: SampleSetWithSelector;
  wholeSampleSet: SampleSetWithSelector;
  variantInternationalSampleSetState: AsyncState<SampleSetWithSelector>;
  wholeInternationalSampleSetState: AsyncState<SampleSetWithSelector>;
}

const deepFocusPaths = {
  internationalComparison: '/international-comparison',
  chen2021Fitness: '/chen-2021-fitness',
  hospitalizationAndDeath: '/hospitalization-death',
};

export const FocusPage = ({
  variantSampleSet,
  wholeSampleSet,
  variantInternationalSampleSetState,
  wholeInternationalSampleSetState,
  ...forwardedProps
}: Props) => {
  const { country, matchPercentage, variant, samplingStrategy } = forwardedProps;
  const plotProps = {
    country,
    matchPercentage,
    mutations: variant.mutations,
    samplingStrategy: toLiteralSamplingStrategy(samplingStrategy),
  };

  const loggedIn = AccountService.isLoggedIn();

  const deepFocusButtons = useMemo(
    () =>
      mapValues(deepFocusPaths, suffix => {
        const to = getFocusPageLink({
          variantSelector: { variant, matchPercentage },
          country,
          samplingStrategy,
          deepFocusPath: suffix,
        });
        return (
          <Button as={Link} to={to} size='sm' className='ml-1'>
            Show more
          </Button>
        );
      }),
    [country, samplingStrategy, matchPercentage, variant]
  );

  const header = (
    <VariantHeader variant={variant} controls={<FocusVariantHeaderControls {...forwardedProps} />} />
  );

  if (variantSampleSet.isEmpty()) {
    return <Alert variant='warning'>No samples match your query</Alert>;
  }

  return (
    <>
      {header}
      <p style={{ marginBottom: '30px' }}>
        The following plots show sequences matching <b>{Math.round(matchPercentage * 100)}%</b> of the
        mutations.
      </p>
      <PackedGrid maxColumns={2}>
        <GridCell minWidth={600}>
          <VariantTimeDistributionPlotWidget.ShareableComponent
            variantSampleSet={variantSampleSet}
            wholeSampleSet={wholeSampleSet}
            height={300}
            title='Sequences over time'
          />
        </GridCell>
        <GridCell minWidth={600}>
          <VariantAgeDistributionPlotWidget.ShareableComponent
            variantSampleSet={variantSampleSet}
            wholeSampleSet={wholeSampleSet}
            height={300}
            title='Demographics'
          />
        </GridCell>
        {loggedIn && country === 'Switzerland' && (
          <GridCell minWidth={600}>
            <NamedCard title='Hospitalization and death' toolbar={deepFocusButtons.hospitalizationAndDeath}>
              <HospitalizationDeathPlot
                field='hospitalized'
                variantSampleSet={variantSampleSet}
                wholeSampleSet={wholeSampleSet}
              />
            </NamedCard>
          </GridCell>
        )}
        <GridCell minWidth={600}>
          <NamedCard title='Fitness advantage estimation' toolbar={deepFocusButtons.chen2021Fitness}>
            <div style={{ height: 300 }}>
              <Chen2021FitnessPreview {...plotProps} />
            </div>
          </NamedCard>
        </GridCell>
        {country === 'Switzerland' && (
          <GridCell minWidth={600}>
            <NamedCard title='Geography'>
              {loggedIn ? (
                <Switzerland variantSampleSet={variantSampleSet} />
              ) : (
                <div>Please log in to view the geographical distribution of cases.</div>
              )}
            </NamedCard>
          </GridCell>
        )}
        {samplingStrategy === SamplingStrategy.AllSamples && (
          <GridCell minWidth={600}>
            <AsyncVariantInternationalComparisonPlot
              height={300}
              title='International comparison'
              toolbarChildren={deepFocusButtons.internationalComparison}
              country={country}
              variantInternationalSampleSetState={variantInternationalSampleSetState}
              wholeInternationalSampleSetState={wholeInternationalSampleSetState}
            />
          </GridCell>
        )}
      </PackedGrid>
    </>
  );
};
