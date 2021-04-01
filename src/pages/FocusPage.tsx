import { mapValues } from 'lodash';
import React, { useMemo } from 'react';
import { AsyncState, PromiseFn, useAsync } from 'react-async';
import { Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FocusVariantHeaderControls } from '../components/FocusVariantHeaderControls';
import Loader from '../components/Loader';
import { NamedCard } from '../components/NamedCard';
import { GridCell, PackedGrid } from '../components/PackedGrid';
import Switzerland from '../components/Switzerland';
import { VariantHeader } from '../components/VariantHeader';
import { getFocusPageLink } from '../helpers/explore-url';
import { SampleSetWithSelector } from '../helpers/sample-set';
import { Chen2021FitnessPreview } from '../models/chen2021Fitness/Chen2021FitnessPreview';
import { getNewSamples, SamplingStrategy, toLiteralSamplingStrategy } from '../services/api';
import { Country, Variant } from '../services/api-types';
import { VariantAgeDistributionPlotWidget } from '../widgets/VariantAgeDistributionPlot';
import { VariantInternationalComparisonPlotWidget } from '../widgets/VariantInternationalComparisonPlot';
import { VariantTimeDistributionPlotWidget } from '../widgets/VariantTimeDistributionPlot';

interface Props {
  country: Country;
  matchPercentage: number;
  variant: Variant;
  samplingStrategy: SamplingStrategy;
  wholeSampleSetState: AsyncState<SampleSetWithSelector>;
}

const deepFocusPaths = {
  internationalComparison: '/international-comparison',
  chen2021Fitness: '/chen-2021-fitness',
};

export const FocusPage = ({ wholeSampleSetState, ...forwardedProps }: Props) => {
  const { country, matchPercentage, variant, samplingStrategy } = forwardedProps;
  const plotProps = {
    country,
    matchPercentage,
    mutations: variant.mutations,
    samplingStrategy: toLiteralSamplingStrategy(samplingStrategy),
  };

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

  const sampleSetPromiseFn = useMemo<PromiseFn<SampleSetWithSelector>>(
    () => (options, { signal }) =>
      getNewSamples(
        {
          country,
          matchPercentage,
          mutations: variant.mutations,
          dataType: toLiteralSamplingStrategy(samplingStrategy),
        },
        signal
      ),
    [country, matchPercentage, variant.mutations, samplingStrategy]
  );
  const sampleSetState = useAsync<SampleSetWithSelector>(sampleSetPromiseFn);

  const header = (
    <VariantHeader variant={variant} controls={<FocusVariantHeaderControls {...forwardedProps} />} />
  );

  if (
    wholeSampleSetState.status === 'initial' ||
    wholeSampleSetState.status === 'pending' ||
    sampleSetState.status === 'initial' ||
    sampleSetState.status === 'pending'
  ) {
    return (
      <>
        {header}
        <Loader />
      </>
    );
  }

  if (wholeSampleSetState.status === 'rejected' || sampleSetState.status === 'rejected') {
    return (
      <>
        {header}
        <Alert variant='danger'>Failed to load samples</Alert>
      </>
    );
  }

  if (sampleSetState.data.isEmpty()) {
    return (
      <>
        {header}
        <Alert variant='warning'>No samples match your query</Alert>
      </>
    );
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
            sampleSet={sampleSetState.data}
            wholeSampleSet={wholeSampleSetState.data}
            height={300}
            title='Sequences over time'
          />
        </GridCell>
        <GridCell minWidth={600}>
          <VariantAgeDistributionPlotWidget.ShareableComponent
            sampleSet={sampleSetState.data}
            wholeSampleSet={wholeSampleSetState.data}
            height={300}
            title='Demographics'
          />
        </GridCell>
        {country === 'Switzerland' && (
          <GridCell minWidth={600}>
            <NamedCard title='Geography'>
              <Switzerland {...plotProps} />
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
        <GridCell minWidth={600}>
          <VariantInternationalComparisonPlotWidget.ShareableComponent
            {...plotProps}
            height={300}
            title='International comparison'
            toolbarChildren={deepFocusButtons.internationalComparison}
          />
        </GridCell>
      </PackedGrid>
    </>
  );
};
