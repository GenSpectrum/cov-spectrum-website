import React from "react";

import { Button, Col, Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { VariantTimeDistributionPlot } from "../widgets/VariantTimeDistributionPlot";
import { WidgetWrapper } from "./WidgetWrapper";
import { VariantAgeDistributionPlot } from "../widgets/VariantAgeDistributionPlot";


export class VariantDashboard extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }


  render() {
    const variantDistributionPlotData = {
      country: this.props.country,
      matchPercentage: this.props.matchPercentage,
      mutations: this.props.variant.mutations
    };

    return (<>
      <div style={{ display: 'flex' }}>
        <h3 style={{ flexGrow: 1 }}>
          {this.props.variant.name ?? 'Unnamed Variant'} in {this.props.country}
        </h3>
        <div>
          <Link
            to={'/sample?mutations=' + this.props.variant.mutations.join(',') +
            '&country=' + this.props.country +
            '&matchPercentage=' + this.props.matchPercentage}
          >
            <Button
              variant="outline-dark"
              size="sm"
            >Show samples</Button>
          </Link>
        </div>
      </div>


      <p><b>Mutations:</b> {this.props.variant.mutations.join(', ')}</p>

      <p>
        The following plots show sequences matching <b>{Math.round(this.props.matchPercentage * 100)}%</b> of the
        mutations.
      </p>

      <Container fluid="md">
        <Row>
          <Col md={7}>
            <WidgetWrapper shareUrl={VariantTimeDistributionPlot.dataToUrl(variantDistributionPlotData)}>
              <VariantTimeDistributionPlot data={variantDistributionPlotData}/>
            </WidgetWrapper>
          </Col>
          <Col md={5}>
            <WidgetWrapper shareUrl={VariantAgeDistributionPlot.dataToUrl(variantDistributionPlotData)}>
              <VariantAgeDistributionPlot data={variantDistributionPlotData}/>
            </WidgetWrapper>
          </Col>
        </Row>
      </Container>
    </>);
  }
}
