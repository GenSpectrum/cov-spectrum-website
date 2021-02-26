import React from 'react';
import { InternationalComparison } from '../components/InternationalComparison';
import { Country, Variant } from '../services/api-types';
import { VariantHeader } from '../components/VariantHeader';
import { VariantAgeDistributionPlotWidget } from '../widgets/VariantAgeDistributionPlot';
import { VariantTimeDistributionPlotWidget } from '../widgets/VariantTimeDistributionPlot';
import { NamedSection } from '../components/NamedSection';

interface Props {
  country: Country;
  matchPercentage: number;
  variant: Variant;
}

export const FocusPage = (props: Props) => {
  const plotProps = {
    country: props.country,
    matchPercentage: props.matchPercentage,
    mutations: props.variant.mutations,
  };
  return (
    <>
      <VariantHeader {...props} />
      <NamedSection title='Sequences over time'>
        <VariantTimeDistributionPlotWidget.ShareableComponent {...plotProps} height={300} />
      </NamedSection>
      <NamedSection title='Demographics'>
        <VariantAgeDistributionPlotWidget.ShareableComponent {...plotProps} height={300} />
      </NamedSection>
      <NamedSection title='International comparison'>
        <InternationalComparison {...props} />
      </NamedSection>
      <NamedSection title='Geography'>
        <p>Variant map goes here</p>
      </NamedSection>
    </>
  );
};
