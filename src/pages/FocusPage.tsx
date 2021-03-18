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
  background: white;
  padding: 15px;
  padding-bottom: 1px;
  margin: 5px;
  border: 1px solid #00000030;
  border-radius: 3px;
`;

const RaisedGridCell = styled.div`
  background: white;
  padding: 15px;
  margin: 5px;
  height: calc(100% - 5px - 5px);
  border: 1px solid #00000030;
  border-radius: 3px;
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
            <NamedSection title='Sequences over time'>
              <VariantTimeDistributionPlotWidget.ShareableComponent {...plotProps} height={300} />
            </NamedSection>
          </RaisedGridCell>
        </GridCell>
        <GridCell minWidth={400}>
          <RaisedGridCell>
            <NamedSection title='Demographics'>
              <VariantAgeDistributionPlotWidget.ShareableComponent {...plotProps} height={300} />
            </NamedSection>
          </RaisedGridCell>
        </GridCell>
        {props.country === 'Switzerland' && (
          <GridCell minWidth={600}>
            <RaisedGridCell>
              <NamedSection title='Geography'>
                <Switzerland {...plotProps} />
              </NamedSection>
            </RaisedGridCell>
          </GridCell>
        )}
        <GridCell minWidth={600}>
          <RaisedGridCell>
            <NamedSection title='International comparison'>
              <InternationalComparison {...props} />
            </NamedSection>
          </RaisedGridCell>
        </GridCell>
      </PackedGrid>
    </>
  );
};
