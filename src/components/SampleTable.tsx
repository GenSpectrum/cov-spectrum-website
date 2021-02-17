import React, { useState, useEffect } from 'react';
import { Col, Container, OverlayTrigger, Row } from 'react-bootstrap';
import { OverlayChildren } from 'react-bootstrap/esm/Overlay';
import Table from 'react-bootstrap/Table';

import { Variant, Country } from '../helpers/types';

import { getSamples } from '../services/api';

//Get information about a sample

// export class SampleTable extends React.Component {

interface Sample {
  name: string;
  date: string;
  country: string;
  mutations: string[];
}

interface Props {
  matchPercentage: number;
  variant: Variant;
  country: Country | null;
}

const SampleRowInner = ({ sample }: { sample: Sample }) => {
  return (
    <tr key={sample.name}>
      <td>{sample.name}</td>
      <td>{sample.date}</td>
      <td>{sample.country}</td>
      <td>{sample.mutations.join(', ')}</td>
    </tr>
  );
};

const SampleRow = ({ sample, popover }: { sample: Sample; popover?: OverlayChildren }) => {
  const inner = <SampleRowInner sample={sample} />;
  if (popover === undefined) {
    return inner;
  }
  return <OverlayTrigger overlay={popover}>{inner}</OverlayTrigger>;
};

export const SampleTable = ({ matchPercentage, variant, country = null }: Props) => {
  const [samples, setSamples] = useState<Sample[] | undefined>(undefined);
  const [totalNumber, setTotalNumber] = useState<number | undefined>(undefined);

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
  }, [matchPercentage, variant.mutations, country]);

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
                  mutations.{' '}
                  {samples &&
                    totalNumber &&
                    samples.length < totalNumber &&
                    samples.length + ' will be displayed.'}
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
                      <SampleRow key={sample.name} sample={sample} />
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
