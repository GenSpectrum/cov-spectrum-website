import React from 'react';
import { InternationalComparison } from '../components/InternationalComparison';
import { Country, Variant } from '../services/api-types';
import { VariantHeader } from '../components/VariantHeader';
import { VariantAgeDistributionPlotWidget } from '../widgets/VariantAgeDistributionPlot';
import { VariantTimeDistributionPlotWidget } from '../widgets/VariantTimeDistributionPlot';
import { NamedSection } from '../components/NamedSection';
import Switzerland from '../components/Switzerland';
import { FocusVariantHeaderControls } from '../components/FocusVariantHeaderControls';

interface Props {
  country: Country;
  matchPercentage: number;
  variant: Variant;
}

export const FocusPage = (props: Props) => {
  const { country, matchPercentage, variant } = props;
  const plotProps = {
    country,
    matchPercentage,
    mutations: variant.mutations,
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
