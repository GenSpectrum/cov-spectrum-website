import React from 'react';
import { Col, Container, Row, Tab, Tabs } from 'react-bootstrap';
import { KnownVariantsList, SelectedVariantAndCountry } from '../components/KnownVariantsList';
import { MutationLookup } from '../components/MutationLookup';
import { NewVariantLookup } from '../components/NewVariantLookup';
import { Country, Variant } from '../services/api-types';

interface Props {
  country: Country;
  onSelectVariant: (selection: { variant: Variant; matchPercentage: number }) => void;
}

export const ExplorePage = ({ country, onSelectVariant }: Props) => {
  const handleSelect = ({ variant }: SelectedVariantAndCountry, matchPercentage: number) => {
    // TODO(voinovp) remove country and this wrapper function
    onSelectVariant({ variant, matchPercentage });
  };

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
                    onVariantSelect={variant => onSelectVariant({ variant, matchPercentage: 0.8 })}
                  />
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
      </Container>
    </div>
  );
};
