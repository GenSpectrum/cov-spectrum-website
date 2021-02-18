import React, { useState } from 'react';
import { NewVariantLookup } from '../components/NewVariantLookup';
import { Col, Container, Row, Tab, Tabs } from 'react-bootstrap';
import { VariantDashboard } from '../components/VariantDashboard';
import { KnownVariantsList, SelectedVariantAndCountry } from '../components/KnownVariantsList';
import { InternationalComparison } from '../components/InternationalComparison';
import { MutationLookup } from '../components/MutationLookup';

import { Variant, Country } from '../services/api-types';

interface DashboardConfiguration {
  variant: Variant | undefined;
  country: Country | undefined;
  matchPercentage: number;
}

export const MainPage = () => {
  const [variantDashboard, setVariantDashboard] = useState<DashboardConfiguration>({
    variant: undefined,
    country: undefined,
    matchPercentage: 0,
  });

  const handleSelect = ({ variant, country }: SelectedVariantAndCountry, matchPercentage: number) => {
    setVariantDashboard({
      variant,
      country,
      matchPercentage,
    });
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <Container fluid='md'>
        <Row>
          <Col>
            <Tabs defaultActiveKey='knownVariants' id='variantList' transition={false} unmountOnExit>
              <Tab eventKey='knownVariants' title='Known Variants'>
                <div style={{ marginTop: '20px' }}>
                  <KnownVariantsList onVariantAndCountrySelect={e => handleSelect(e, 0.8)} />
                </div>
              </Tab>
              <Tab eventKey='newVariants' title='Find New Variants'>
                <div style={{ marginTop: '20px' }}>
                  <NewVariantLookup onVariantAndCountrySelect={e => handleSelect(e, 1)} />
                </div>
              </Tab>
              <Tab eventKey='lookupMutations' title='Lookup Mutations'>
                <div style={{ marginTop: '20px' }}>
                  <MutationLookup onVariantAndCountrySelect={handleSelect} />
                </div>
              </Tab>
              <Tab eventKey='variantMap' title='Map of Variants'>
                <div style={{ marginTop: '20px' }}>
                  <p>Variant map goes here</p>
                </div>
              </Tab>
            </Tabs>
          </Col>
        </Row>

        {variantDashboard.country && variantDashboard.variant ? (
          <>
            <hr />
            <VariantDashboard
              country={variantDashboard.country}
              variant={variantDashboard.variant}
              matchPercentage={variantDashboard.matchPercentage}
            />
            <hr />
            <InternationalComparison
              country={variantDashboard.country}
              variant={variantDashboard.variant}
              matchPercentage={variantDashboard.matchPercentage}
            />
          </>
        ) : null}
      </Container>
    </div>
  );
};
