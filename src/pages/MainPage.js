import React from 'react'
import { NewVariantLookup } from '../components/NewVariantLookup'
import { Col, Container, Row, Tab, Tabs } from 'react-bootstrap'
import { VariantDashboard } from '../components/VariantDashboard'
import { KnownVariantsList } from '../components/KnownVariantsList'
import { InternationalComparison } from '../components/InternationalComparison'
import { MutationLookup } from '../components/MutationLookup'

export class MainPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      variantDashboard: {
        variant: null,
        country: null,
      },
    }

    this.handleVariantAndCountrySelect = this.handleVariantAndCountrySelect.bind(this)
  }

  handleVariantAndCountrySelect({ variant, country }, matchPercentage) {
    this.setState({
      variantDashboard: {
        variant,
        country,
        matchPercentage,
      },
    })
  }

  render() {
    return (
      <div style={{ marginTop: '20px' }}>
        <Container fluid='md'>
          <Row>
            <Col>
              <Tabs defaultActiveKey='knownVariants' id='variantList' transition={false}>
                <Tab eventKey='knownVariants' title='Known Variants'>
                  <div style={{ marginTop: '20px' }}>
                    <KnownVariantsList
                      onVariantAndCountrySelect={e => this.handleVariantAndCountrySelect(e, 0.8)}
                    />
                  </div>
                </Tab>
                <Tab eventKey='newVariants' title='Find New Variants'>
                  <div style={{ marginTop: '20px' }}>
                    <NewVariantLookup
                      onVariantAndCountrySelect={e => this.handleVariantAndCountrySelect(e, 1)}
                    />
                  </div>
                </Tab>
                <Tab eventKey='lookupMutations' title='Lookup Mutations'>
                  <div style={{ marginTop: '20px' }}>
                    <MutationLookup onVariantAndCountrySelect={this.handleVariantAndCountrySelect} />
                  </div>
                </Tab>
              </Tabs>
            </Col>
          </Row>

          {this.state.variantDashboard.country && this.state.variantDashboard.variant ? (
            <>
              <hr />
              <VariantDashboard
                country={this.state.variantDashboard.country}
                variant={this.state.variantDashboard.variant}
                matchPercentage={this.state.variantDashboard.matchPercentage}
              />
              <hr />
              <InternationalComparison
                country={this.state.variantDashboard.country}
                variant={this.state.variantDashboard.variant}
                matchPercentage={this.state.variantDashboard.matchPercentage}
              />
            </>
          ) : null}
        </Container>
      </div>
    )
  }
}
