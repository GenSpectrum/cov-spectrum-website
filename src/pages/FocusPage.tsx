import React from 'react';
import { InternationalComparison } from '../components/InternationalComparison';
import { Country, Variant } from '../services/api-types';
import { VariantHeader } from '../components/VariantHeader';
import { VariantAgeDistributionPlotWidget } from '../widgets/VariantAgeDistributionPlot';
import { VariantTimeDistributionPlotWidget } from '../widgets/VariantTimeDistributionPlot';
import { NamedSection } from '../components/NamedSection';
import Switzerland from '../components/Switzerland';
import { GridCell, PackedGrid } from '../components/PackedGrid';

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
      <PackedGrid>
        <GridCell minWidth={400} maxWidth={500} minHeight={200}>
          Test A
        </GridCell>
        <GridCell minWidth={400} maxWidth={500} minHeight={300}>
          Test B
        </GridCell>
      </PackedGrid>
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
