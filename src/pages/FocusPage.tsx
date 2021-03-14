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
          <NamedSection title='Sequences over time'>
            <VariantTimeDistributionPlotWidget.ShareableComponent {...plotProps} height={300} />
          </NamedSection>
        </GridCell>
        <GridCell minWidth={400}>
          <NamedSection title='Demographics'>
            <VariantAgeDistributionPlotWidget.ShareableComponent {...plotProps} height={300} />
          </NamedSection>
        </GridCell>
        {props.country === 'Switzerland' && (
          <GridCell>
            <NamedSection title='Geography'>
              <Switzerland {...plotProps} />
            </NamedSection>
          </GridCell>
        )}
        <GridCell>
          <NamedSection title='Models'>
            {/*TODO Should we make height optional?*/}
            <Chen2021FitnessWidget.ShareableComponent {...plotProps} height={-1} />
          </NamedSection>
        </GridCell>
        <GridCell>
          <NamedSection title='International comparison'>
            <InternationalComparison {...props} />
          </NamedSection>
        </GridCell>
      </PackedGrid>
    </>
  );
};
