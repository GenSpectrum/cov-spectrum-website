import React, { useState, useEffect } from 'react';
import { NewVariantLookup } from '../components/NewVariantLookup';
import { Col, Container, Row, Tab, Tabs } from 'react-bootstrap';
import { VariantDashboard } from '../components/VariantDashboard';
import { KnownVariantsList } from '../components/KnownVariantsList';
import { InternationalComparison } from '../components/InternationalComparison';
import { MutationLookup } from '../components/MutationLookup';

// export class MainPage extends React.Component {
// constructor(props) {
//   super(props);
//   this.state = {
//     variantDashboard: {
//       variant: null,
//       country: null,
//     },
//   };

//   this.handleVariantAndCountrySelect = this.handleVariantAndCountrySelect.bind(this);
// }

// handleVariantAndCountrySelect({ variant, country }, matchPercentage) {
//   this.setState({
//     variantDashboard: {
//       variant,
//       country,
//       matchPercentage,
//     },
//   });
// }
export const MainPage = () => {
  const [variantDashboard, setVariantDashboard] = useState({ variant: null, country: null });

  const handleSelect = ({ variant, country }, matchPercentage) => {
    setVariantDashboard({
      variant,
      country,
      matchPercentage,
    });
  };

  // render() {
  return (
    <div style={{ marginTop: '20px' }}>
      <Container fluid='md'>
        <Row>
          <Col>
            <Tabs defaultActiveKey='knownVariants' id='variantList' transition={false}>
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
        ) : (
          <h1>ERROR</h1>
        )}
      </Container>
    </div>
  );
  // }
};
