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
import styled from 'styled-components';

interface Props {
  country: Country;
  matchPercentage: number;
  variant: Variant;
  samplingStrategy: SamplingStrategy;
}

const HeaderArea = styled.div`
  padding: 0 10px 0 10px;
`;

const RaisedGridCell = styled.div`
  margin: 5px;
  background: #f9f9f9;
  padding: 10px 15px;
  border: 1px solid #00000020;
`;

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
      <HeaderArea>
        <VariantHeader variant={variant} controls={<FocusVariantHeaderControls {...props} />} />
        <p style={{ marginBottom: '30px' }}>
          The following plots show sequences matching <b>{Math.round(matchPercentage * 100)}%</b> of the
          mutations.
        </p>
      </HeaderArea>
      <PackedGrid>
        <GridCell minWidth={800}>
          <RaisedGridCell>
            <NamedSection title='Sequences over time' raised>
              <VariantTimeDistributionPlotWidget.ShareableComponent {...plotProps} height={300} />
            </NamedSection>
          </RaisedGridCell>
        </GridCell>
        <GridCell minWidth={400}>
          <RaisedGridCell>
            <NamedSection title='Demographics' raised>
              <VariantAgeDistributionPlotWidget.ShareableComponent {...plotProps} height={300} />
            </NamedSection>
          </RaisedGridCell>
        </GridCell>
        {props.country === 'Switzerland' && (
          <GridCell minWidth={600}>
            <RaisedGridCell>
              <NamedSection title='Geography' raised>
                <Switzerland {...plotProps} />
              </NamedSection>
            </RaisedGridCell>
          </GridCell>
        )}
        <GridCell minWidth={600}>
          <RaisedGridCell>
            <NamedSection title='International comparison' raised>
              <InternationalComparison {...props} />
            </NamedSection>
          </RaisedGridCell>
        </GridCell>
      </PackedGrid>
    </>
  );
};
