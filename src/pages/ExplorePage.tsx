import React from 'react';
import { Col, Container, Row, Tab, Tabs } from 'react-bootstrap';
import { KnownVariantsList } from '../components/KnownVariantsList';
import { MutationLookup } from '../components/MutationLookup';
import { NewVariantLookup } from '../components/NewVariantLookup';
import { Country, Variant } from '../services/api-types';

interface Props {
  country: Country;
  onVariantSelect: (selection: { variant: Variant; matchPercentage: number }) => void;
}

export const ExplorePage = ({ country, onVariantSelect }: Props) => {
  return (
    <div style={{ marginTop: '20px' }}>
      <Container fluid='md'>
        <Row>
          <Col>
            <Tabs defaultActiveKey='knownVariants' id='variantList' transition={false} unmountOnExit>
              <Tab eventKey='knownVariants' title='Known Variants'>
                <div style={{ marginTop: '20px' }}>
                  <KnownVariantsList
                    country={country}
                    onVariantSelect={variant => onVariantSelect({ variant, matchPercentage: 0.8 })}
                  />
                </div>
              </Tab>
              <Tab eventKey='newVariants' title='Find New Variants'>
                <div style={{ marginTop: '20px' }}>
                  <NewVariantLookup
                    country={country}
                    onVariantSelect={variant => onVariantSelect({ variant, matchPercentage: 1 })}
                  />
                </div>
              </Tab>
              <Tab eventKey='lookupMutations' title='Lookup Mutations'>
                <div style={{ marginTop: '20px' }}>
                  <MutationLookup onVariantSelect={onVariantSelect} />
                </div>
              </Tab>
            </Tabs>
          </Col>
        </Row>
      </Container>
    </div>
  );
};
