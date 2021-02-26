import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Country, Variant } from '../services/api-types';
import { VariantAgeDistributionPlotWidget } from '../widgets/VariantAgeDistributionPlot';
import { VariantTimeDistributionPlotWidget } from '../widgets/VariantTimeDistributionPlot';

interface Props {
  country: Country;
  matchPercentage: number;
  variant: Variant;
}

export const VariantDashboard = ({ country, matchPercentage, variant }: Props) => {
  return (
    <>
      <Container fluid='md'>
        <Row style={{ height: '500px' }}>
          <Col md={7}>
            <VariantTimeDistributionPlotWidget.ShareableComponent
              country={country}
              matchPercentage={matchPercentage}
              mutations={variant.mutations}
            />
          </Col>
          <Col md={5}>
            <VariantAgeDistributionPlotWidget.ShareableComponent
              country={country}
              matchPercentage={matchPercentage}
              mutations={variant.mutations}
            />
          </Col>
        </Row>
      </Container>
    </>
  );
};
