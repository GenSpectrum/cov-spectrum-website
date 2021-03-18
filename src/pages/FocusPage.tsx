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
import { Button } from 'react-bootstrap';

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
  position: relative;
  margin: 5px;
  background: white;
  padding: 12px 15px;
  border: 1px solid #0000001f;
  box-shadow: #00000059 0 2px 3px 0px;
`;

const MoreButtonWrapper = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
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
            <MoreButtonWrapper>
              <Button size='sm'>Show more</Button>
            </MoreButtonWrapper>
            <NamedSection title='Sequences over time' raised>
              <VariantTimeDistributionPlotWidget.ShareableComponent {...plotProps} height={300} />
            </NamedSection>
          </RaisedGridCell>
        </GridCell>
        <GridCell minWidth={400}>
          <RaisedGridCell>
            <MoreButtonWrapper>
              <Button size='sm'>Show more</Button>
            </MoreButtonWrapper>
            <NamedSection title='Demographics' raised>
              <VariantAgeDistributionPlotWidget.ShareableComponent {...plotProps} height={300} />
            </NamedSection>
          </RaisedGridCell>
        </GridCell>
        {props.country === 'Switzerland' && (
          <GridCell minWidth={600}>
            <RaisedGridCell>
              <MoreButtonWrapper>
                <Button size='sm'>Show more</Button>
              </MoreButtonWrapper>
              <NamedSection title='Geography' raised>
                <Switzerland {...plotProps} />
              </NamedSection>
            </RaisedGridCell>
          </GridCell>
        )}
        <GridCell minWidth={600}>
          <RaisedGridCell>
            <MoreButtonWrapper>
              <Button size='sm'>Show more</Button>
            </MoreButtonWrapper>
            <NamedSection title='International comparison' raised>
              <InternationalComparison {...props} />
            </NamedSection>
          </RaisedGridCell>
        </GridCell>
      </PackedGrid>
    </>
  );
};
