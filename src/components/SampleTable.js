import React from "react";
import { BackendService } from "../services/BackendService";
import { Col, Container, Row } from "react-bootstrap";
import Table from "react-bootstrap/Table";


export class SampleTable extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      totalNumber: null,
      samples: null
    };
  }


  componentDidMount() {
    this.updateView();
  }


  componentDidUpdate(prevProps, prevState, snapshot) {
    // TODO Use a better equality check for the variant
    if (prevProps.variant !== this.props.variant || prevProps.country !== this.props.country
      || prevProps.matchPercentage !== this.props.matchPercentage) {
      this.updateView();
    }
  }


  async updateView() {
    this.loadSamples();
  }


  async loadSamples() {
    this.setState({
      totalNumber: null,
      samples: null
    });
    this.state.distribution = null;
    const mutationsString = this.props.variant.mutations.join(',');
    const endpoint = '/resource/sample';
    let url = `${endpoint}?mutations=${mutationsString}&matchPercentage=${this.props.matchPercentage}`;
    if (this.props.country) {
      url += `&country=${this.props.country}`;
    }
    const response = await BackendService.get(url);
    this.setState({
      totalNumber: response.totalAvailableSamples,
      samples: response.samples
    });
  }


  render() {

    return (
      <div style={{ marginTop: '20px' }}>
        <Container fluid="md">
          <Row>
            <Col>
              <h3>Samples {this.props.country && 'in ' + this.props.country}</h3>

              <p><b>Mutations:</b> {this.props.variant.mutations.join(', ')}</p>

              {
                this.state.samples && (<>
                  <p>{ this.state.totalNumber } samples have at least <b>{Math.round(this.props.matchPercentage * 100)}%
                  </b> of the mutations. {this.state.samples.length < this.state.totalNumber
                  && this.state.samples.length + ' will be displayed.'}</p>

                  <Table striped bordered hover>
                    <thead>
                    <tr>
                      <th>GISAID ID</th>
                      <th>Date</th>
                      <th>Country</th>
                      <th>Mutations</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                      this.state.samples.map( sample =>
                        <tr key={sample.name}>
                          <td>{sample.name}</td>
                          <td>{sample.date}</td>
                          <td>{sample.country}</td>
                          <td>{sample.mutations.join(', ')}</td>
                        </tr>
                      )
                    }
                    </tbody>
                  </Table>

                </>)
              }

            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}
