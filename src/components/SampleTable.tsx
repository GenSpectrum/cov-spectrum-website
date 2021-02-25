import React, { useState, useEffect } from 'react';
import { Col, Container, Overlay, Popover, Row, Table } from 'react-bootstrap';

import { Variant, Country, Sample } from '../services/api-types';
import { getSamples } from '../services/api';

type SampleMetadata = NonNullable<Sample['metadata']>;

interface PopoverTarget {
  element: HTMLElement;
  sample: Sample & { metadata: SampleMetadata };
}

function formatMetadata(
  sampleDate: string | null,
  metadata: SampleMetadata
): { label: string; value: string | undefined }[] {
  const rawEntries: [string, string | number | null][] = [
    ['Date', sampleDate],
    ['Country', metadata.country],
    ['Division', metadata.division],
    ['Location', metadata.location],
    ['Host', metadata.host],
    ['Age', metadata.age || null],
    ['Sex', metadata.sex === '?' ? null : metadata.sex],
    ['Submitting Lab', metadata.submittingLab],
    ['Originating Lab', metadata.originatingLab],
  ];
  return rawEntries.map(([label, value]) => ({
    label,
    value: value === null ? undefined : value.toString(),
  }));
}

function sampleHasMetadata(sample: Sample): sample is Sample & { metadata: SampleMetadata } {
  return sample.metadata !== null;
}

interface Props {
  matchPercentage: number;
  variant: Variant;
  country?: Country;
}

// SampleTable shows detailed information about individual samples from GISAID
export const SampleTable = ({ matchPercentage, variant, country }: Props) => {
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

  const [popoverTarget, setPopoverTarget] = useState<PopoverTarget>();
  useEffect(() => {
    if (popoverTarget && !samples?.includes(popoverTarget.sample)) {
      setPopoverTarget(undefined);
    }
  }, [samples, popoverTarget]);

  return (
    <div style={{ marginTop: '20px' }}>
      <Container fluid='md'>
        <Row>
          <Col>
            <h3>Samples {country && 'in ' + country}</h3>

            <p>
              <b>Mutations:</b> {variant.mutations.join(', ')}
            </p>

            {popoverTarget && (
              <Overlay show target={popoverTarget.element} placement='right' transition={false}>
                <Popover id='sample-metadata-popover'>
                  <Popover.Title>{popoverTarget.sample.name}</Popover.Title>
                  <Popover.Content>
                    {formatMetadata(popoverTarget.sample.date, popoverTarget.sample.metadata).map(
                      ({ label, value }) => (
                        <div key={label}>
                          <b>{label}:</b> {value ?? <i className='text-muted'>unknown</i>}
                        </div>
                      )
                    )}
                  </Popover.Content>
                </Popover>
              </Overlay>
            )}

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
                      <tr key={sample.name}>
                        <td
                          onMouseEnter={ev =>
                            setPopoverTarget(
                              sampleHasMetadata(sample) ? { element: ev.currentTarget, sample } : undefined
                            )
                          }
                          onMouseLeave={() => setPopoverTarget(undefined)}
                        >
                          {sample.name}
                        </td>
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
};
