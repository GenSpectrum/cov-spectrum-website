import React from "react";
import { NewVariantPage } from "./NewVariantPage";
import { Col, Container, Row, Tab, Tabs } from "react-bootstrap";
import { VariantDashboard } from "./VariantDashboard";
import { KnownVariantsList } from "./KnownVariantsList";


export class MainPage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      variantDashboard: {
        variant: null,
        country: null
      }
    };

    this.handleVariantAndCountrySelect = this.handleVariantAndCountrySelect.bind(this);
  }


  handleVariantAndCountrySelect({ variant, country }, matchPercentage) {
    this.setState({
      variantDashboard: {
        variant,
        country,
        matchPercentage
      }
    });
  }


  render() {
    return (
      <div style={{ marginTop: '20px' }}>
        <Container fluid="md">
          <Row>
            <Col>
              <Tabs defaultActiveKey="knownVariants" id="variantList" transition={false}>
                <Tab eventKey="knownVariants" title="Known Variants">
                  <KnownVariantsList onVariantAndCountrySelect={e =>
                    this.handleVariantAndCountrySelect(e, 0.8)}/>
                </Tab>
                <Tab eventKey="newVariants" title="Find New Variants">
                  <NewVariantPage onVariantAndCountrySelect={e =>
                    this.handleVariantAndCountrySelect(e, 1)}/>
                </Tab>
              </Tabs>
            </Col>
          </Row>

          {
            this.state.variantDashboard.country && this.state.variantDashboard.variant ?
              <>
                <hr />
                <VariantDashboard
                  country={this.state.variantDashboard.country}
                  variant={this.state.variantDashboard.variant}
                  matchPercentage={this.state.variantDashboard.matchPercentage}
                />
              </>:
              null
          }

        </Container>
      </div>
    );
  }

}
