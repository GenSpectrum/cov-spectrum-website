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
      <NamedSection title='Sequences over time'>
        <VariantTimeDistributionPlotWidget.ShareableComponent {...plotProps} height={300} />
      </NamedSection>
      <NamedSection title='Demographics'>
        <VariantAgeDistributionPlotWidget.ShareableComponent {...plotProps} height={300} />
      </NamedSection>
      {props.country === 'Switzerland' && (
        <NamedSection title='Geography'>
          <Switzerland {...plotProps} />
        </NamedSection>
      )}
      <NamedSection title='International comparison'>
        <InternationalComparison {...props} />
      </NamedSection>
    </>
  );
};
