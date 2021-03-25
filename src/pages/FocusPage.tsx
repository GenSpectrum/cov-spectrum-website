import React, { useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FocusVariantHeaderControls } from '../components/FocusVariantHeaderControls';
import { NamedCard } from '../components/NamedCard';
import { GridCell, PackedGrid } from '../components/PackedGrid';
import Switzerland from '../components/Switzerland';
import { VariantHeader } from '../components/VariantHeader';
import { getFocusPageLink } from '../helpers/explore-url';
import { Chen2021FitnessPreview } from '../models/chen2021Fitness/Chen2021FitnessPreview';
import { SamplingStrategy, toLiteralSamplingStrategy } from '../services/api';
import { Country, Variant } from '../services/api-types';
import { VariantAgeDistributionPlotWidget } from '../widgets/VariantAgeDistributionPlot';
import { VariantInternationalComparisonPlotWidget } from '../widgets/VariantInternationalComparisonPlot';
import { VariantTimeDistributionPlotWidget } from '../widgets/VariantTimeDistributionPlot';

interface Props {
  country: Country;
  matchPercentage: number;
  variant: Variant;
  samplingStrategy: SamplingStrategy;
}

export const FocusPage = (props: Props) => {
  const { country, matchPercentage, variant, samplingStrategy } = props;

  const plotProps = {
    country,
    matchPercentage,
    mutations: variant.mutations,
    samplingStrategy: toLiteralSamplingStrategy(samplingStrategy),
  };

  const internationalComparisonLink = useMemo(
    () =>
      getFocusPageLink({
        variantSelector: { variant, matchPercentage },
        country,
        samplingStrategy,
        deepFocusPath: '/international-comparison',
      }),
    [country, samplingStrategy, matchPercentage, variant]
  );

  const chen2021FitnessLink = useMemo(
    () =>
      getFocusPageLink({
        variantSelector: { variant, matchPercentage },
        country,
        samplingStrategy,
        deepFocusPath: '/chen-2021-fitness',
      }),
    [country, samplingStrategy, matchPercentage, variant]
  );

  return (
    <>
      <VariantHeader variant={variant} controls={<FocusVariantHeaderControls {...props} />} />
      <p style={{ marginBottom: '30px' }}>
        The following plots show sequences matching <b>{Math.round(matchPercentage * 100)}%</b> of the
        mutations.
      </p>
      <PackedGrid>
        <GridCell minWidth={800}>
          <VariantTimeDistributionPlotWidget.ShareableComponent
            {...plotProps}
            height={300}
            title='Sequences over time'
          />
        </GridCell>
        <GridCell minWidth={400}>
          <VariantAgeDistributionPlotWidget.ShareableComponent
            {...plotProps}
            height={300}
            title='Demographics'
          />
        </GridCell>
        {props.country === 'Switzerland' && (
          <GridCell>
            <NamedCard title='Geography'>
              <Switzerland {...plotProps} />
            </NamedCard>
          </GridCell>
        )}
        <GridCell>
          <NamedCard
            title='Fitness advantage estimation'
            toolbar={
              <Button as={Link} to={chen2021FitnessLink} size='sm' className='ml-1'>
                Show more
              </Button>
            }
          >
            <div style={{ height: 400 }}>
              <Chen2021FitnessPreview {...plotProps} />
            </div>
          </NamedCard>
        </GridCell>
        <GridCell>
          <VariantInternationalComparisonPlotWidget.ShareableComponent
            {...plotProps}
            height={300}
            title='International comparison'
            toolbarChildren={
              <Button as={Link} to={internationalComparisonLink} size='sm' className='ml-1'>
                Show more
              </Button>
            }
          />
        </GridCell>
      </PackedGrid>
    </>
  );
};
