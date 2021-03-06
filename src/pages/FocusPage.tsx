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
        <GridCell minWidth={400} maxWidth={1000}>
          <NamedSection title='Sequences over time'>
            <VariantTimeDistributionPlotWidget.ShareableComponent {...plotProps} height={300} />
          </NamedSection>
        </GridCell>
        <GridCell minWidth={300} maxWidth={500}>
          <NamedSection title='Demographics'>
            <VariantAgeDistributionPlotWidget.ShareableComponent {...plotProps} height={300} />
          </NamedSection>
        </GridCell>
        {props.country === 'Switzerland' && (
          <GridCell minWidth={600} maxWidth={1000}>
            <NamedSection title='Geography'>
              <Switzerland {...plotProps} />
            </NamedSection>
          </GridCell>
        )}
        <GridCell minWidth={800} maxWidth={1000}>
          <NamedSection title='International comparison'>
            <InternationalComparison {...props} />
          </NamedSection>
        </GridCell>
      </PackedGrid>
    </>
  );
};
