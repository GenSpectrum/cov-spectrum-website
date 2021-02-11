import React, { useState, useEffect } from 'react';
import { BackendService } from '../services/BackendService';
import { Col, Container, Row } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';

// import { Mutation, Variant, Country } from '../helpers/types';

import { getSamples } from '../services/api';

//Get information about a sample

// export class SampleTable extends React.Component {

// interface Props {
//   mutations: Mutation[];
//   matchPercentage: number;
//   variant: Variant;
// }
export const SampleTable = ({ mutations, matchPercentage, variant, country = null }) => {
  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     totalNumber: null,
  //     samples: null,
  //     req: null,
  //   };
  // }

  // componentDidMount() {
  //   this.updateView();
  // }

  // componentDidUpdate(prevProps, prevState, snapshot) {
  //   // TODO Use a better equality check for the variant
  //   if (
  //     prevProps.variant !== this.props.variant ||
  //     prevProps.country !== this.props.country ||
  //     prevProps.matchPercentage !== this.props.matchPercentage
  //   ) {
  //     this.updateView();
  //   }
  // }

  // async updateView() {
  //   this.loadSamples();
  // }

  // async loadSamples() {
  //   this.state.req?.cancel();
  //   this.setState({
  //     totalNumber: null,
  //     samples: null,
  //   });

  //   const mutationsString = this.props.variant.mutations.join(',');
  //   const endpoint = '/resource/sample';
  //   let url = `${endpoint}?mutations=${mutationsString}&matchPercentage=${this.props.matchPercentage}`;
  //   if (this.props.country) {
  //     url += `&country=${this.props.country}`;
  //   }
  //   const req = BackendService.get(url);
  //   this.setState({ req });
  //   const response = await (await req).json();

  //   this.setState({
  //     totalNumber: response.total,
  //     samples: response.data,
  //   });
  // }

  // render() {
  const [samples, setSamples] = useState(null);
  const [totalNumber, setTotalNumber] = useState(null);

  useEffect(() => {
    let isSubscribed = true;
    const controller = new AbortController();
    const signal = controller.signal;

    const mutationsString = variant.mutations.join(',');

    getSamples(mutationsString, matchPercentage, country, signal).then(response => {
      if (isSubscribed) {
        setTotalNumber(response.total);
        setSamples(response.data);
      }
    });

    return () => {
      isSubscribed = false;
      controller.abort();
    };
  }, []);

  // const [numberOfSamples, setNumberOfSamples] = useState(null);

  return (
    <div style={{ marginTop: '20px' }}>
      <Container fluid='md'>
        <Row>
          <Col>
            <h3>Samples {country && 'in ' + country}</h3>

            <p>
              <b>Mutations:</b> {variant.mutations.join(', ')}
            </p>

            {samples && (
              <>
                <p>
                  {totalNumber} samples have at least <b>{Math.round(matchPercentage * 100)}%</b> of the
                  mutations. {samples.length < totalNumber && samples.length + ' will be displayed.'}
                </p>

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
                    {samples.map(sample => (
                      <tr key={sample.name}>
                        <td>{sample.name}</td>
                        <td>{sample.date}</td>
                        <td>{sample.country}</td>
                        <td>{sample.mutations.join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
  // }
};
