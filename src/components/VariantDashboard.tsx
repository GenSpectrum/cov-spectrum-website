import React from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getSamplePageLink } from '../pages/SamplePage';
import { Country, Variant } from '../services/api-types';
import { VariantAgeDistributionPlotWidget } from '../widgets/VariantAgeDistributionPlot';
import { VariantTimeDistributionPlotWidget } from '../widgets/VariantTimeDistributionPlot';
import { AccountService } from '../services/AccountService';
import { NextcladeService } from '../services/NextcladeService';

interface Props {
  country: Country;
  matchPercentage: number;
  variant: Variant;
}

export const VariantDashboard = ({ country, matchPercentage, variant }: Props) => {
  return (
    <>
      <div style={{ display: 'flex' }}>
        <h3 style={{ flexGrow: 1 }}>
          {variant.name ?? 'Unnamed Variant'} in {country}
        </h3>
        <div>
          {AccountService.isLoggedIn() && (
            <Button
              onClick={() => NextcladeService.showVariantOnNextclade(variant, matchPercentage, country)}
              variant='outline-dark'
              size='sm'
              className='mr-2'
            >
              Show on Nextclade
            </Button>
          )}
          <Link to={getSamplePageLink({ mutations: variant.mutations, country, matchPercentage })}>
            <Button variant='outline-dark' size='sm'>
              Show samples
            </Button>
          </Link>
        </div>
      </div>

      <p>
        <b>Mutations:</b> {variant.mutations.join(', ')}
      </p>

      <p>
        The following plots show sequences matching <b>{Math.round(matchPercentage * 100)}%</b> of the
        mutations.
      </p>

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
