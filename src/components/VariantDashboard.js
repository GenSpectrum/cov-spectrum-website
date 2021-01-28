import React from "react";
import { BackendService } from "../services/BackendService";

// See https://github.com/plotly/react-plotly.js/issues/135#issuecomment-500399098
import createPlotlyComponent from 'react-plotly.js/factory';
import { Button, Col, Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";

const Plotly = window.Plotly;
const Plot = createPlotlyComponent(Plotly);


export class VariantDashboard extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      ageDistribution: null,
      timeDistribution: null
    };
  }


  componentDidMount() {
    this.updateView();
  }


  componentDidUpdate(prevProps, prevState, snapshot) {
    // TODO Use a better equality check for the variant
    if (prevProps.country !== this.props.country || prevProps.variant !== this.props.variant
      || prevProps.matchPercentage !== this.props.matchPercentage) {
      this.updateView();
    }
  }


  async updateView() {
    this.loadTimeDistribution();
    this.loadAgeDistribution();
  }


  async loadTimeDistribution() {
    this.state.timeDistribution = null;
    const mutationsString = this.props.variant.mutations.join(',');
    const endpoint = '/variant/time-distribution';
    const timeDistribution
      = await BackendService.get(`${endpoint}?country=${this.props.country}&mutations=${mutationsString}` +
      `&matchPercentage=${this.props.matchPercentage}`);
    this.setState({ timeDistribution })
  }


  async loadAgeDistribution() {
    this.state.ageDistribution = null;
    const mutationsString = this.props.variant.mutations.join(',');
    const endpoint = '/variant/age-distribution';
    const ageDistribution
      = await BackendService.get(`${endpoint}?country=${this.props.country}&mutations=${mutationsString}` +
      `&matchPercentage=${this.props.matchPercentage}`);
    this.setState({ ageDistribution })
  }


  render() {
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
            {
              this.state.timeDistribution ? (
                  <Plot
                    style={{ width: '100%' }}
                    data={[
                      {
                        type: 'bar',
                        x: this.state.timeDistribution.map(d => new Date(d.week.firstDayInWeek)),
                        y: this.state.timeDistribution.map(d => d.count)
                      },
                      {
                        x: this.state.timeDistribution.map(d => new Date(d.week.firstDayInWeek)),
                        y: this.state.timeDistribution.map(d => d.proportion * 100),
                        type: 'scatter',
                        mode: 'lines+markers',
                        marker: { color: 'red' },
                        yaxis: 'y2'
                      }
                    ]}
                    layout={{
                      height: 500,
                      title: 'Time Distribution',
                      yaxis: {
                        title: 'Number Sequences'
                      },
                      yaxis2: {
                        title: 'Estimated Percentage',
                        overlaying: 'y',
                        side: 'right'
                      },
                      showlegend: false
                    }}
                    config={{
                      displaylogo: false,
                      modeBarButtons: [["zoom2d", "toImage", "resetScale2d", "pan2d"]]
                    }}
                  />
                ) :
                null
            }
          </Col>
          <Col md={5}>
            {
              this.state.ageDistribution ? (
                  <Plot
                    style={{ width: '100%' }}
                    data={[
                      {
                        type: 'bar',
                        x: this.state.ageDistribution.map(d => d.ageGroup),
                        y: this.state.ageDistribution.map(d => d.count)
                      },
                      {
                        x: this.state.ageDistribution.map(d => d.ageGroup),
                        y: this.state.ageDistribution.map(d => d.proportion * 100),
                        type: 'scatter',
                        mode: 'lines+markers',
                        marker: { color: 'red' },
                        yaxis: 'y2'
                      }
                    ]}
                    layout={{
                      height: 500,
                      title: 'Age Distribution',
                      yaxis: {
                        title: 'Number Sequences'
                      },
                      yaxis2: {
                        title: 'Estimated Percentage',
                        overlaying: 'y',
                        side: 'right'
                      },
                      showlegend: false
                    }}
                    config={{
                      displaylogo: false,
                      modeBarButtons: [["zoom2d", "toImage", "resetScale2d", "pan2d"]]
                    }}
                  />
                ) :
                null
            }
          </Col>
        </Row>
      </Container>
    </>);
  }


}
