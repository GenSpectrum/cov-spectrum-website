import React from 'react';
import { InternationalComparison } from '../components/InternationalComparison';
import { Country, Variant } from '../services/api-types';
import { VariantHeader } from '../components/VariantHeader';
import { VariantAgeDistributionPlotWidget } from '../widgets/VariantAgeDistributionPlot';
import { VariantTimeDistributionPlotWidget } from '../widgets/VariantTimeDistributionPlot';
import { NamedSection } from '../components/NamedSection';
import Switzerland from '../components/Switzerland';
import { GridCell, PackedGrid } from '../components/PackedGrid';
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
        <GridCell minWidth={800}>
          <NamedSection title='International comparison'>
            <InternationalComparison {...props} />
          </NamedSection>
        </GridCell>
      </PackedGrid>
    </>
  );
};
