import React from 'react';
import { FocusVariantHeaderControls } from '../components/FocusVariantHeaderControls';
import { InternationalComparison } from '../components/InternationalComparison';
import { NamedSection } from '../components/NamedSection';
import Switzerland from '../components/Switzerland';
import { VariantHeader } from '../components/VariantHeader';
import { SamplingStrategy, toLiteralSamplingStrategy } from '../services/api';
import { Country, Variant } from '../services/api-types';
import { VariantAgeDistributionPlotWidget } from '../widgets/VariantAgeDistributionPlot';
import { VariantTimeDistributionPlotWidget } from '../widgets/VariantTimeDistributionPlot';
import { GridCell, PackedGrid } from '../components/PackedGrid';
import { Chen2021FitnessWidget } from '../models/chen2021Fitness/Chen2021FitnessWidget';
import { NamedCard } from '../components/NamedCard';

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
          {/*TODO Should we make height optional?*/}
          <Chen2021FitnessWidget.ShareableComponent {...plotProps} height={-1} title='Models' />
        </GridCell>
        <GridCell>
          <InternationalComparison {...props} />
        </GridCell>
      </PackedGrid>
    </>
  );
};
