import React, { useEffect, useState } from 'react';
import { Overlay, Popover, Table } from 'react-bootstrap';
import { getSamples } from '../services/api';
import { Country, Sample, Variant } from '../services/api-types';
import { MutationList } from './MutationList';

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

function formatMutations(sample: Sample): JSX.Element {
  if (sample.mutations) {
    return <MutationList mutations={sample.mutations} />;
  } else {
    return (
      <i className='text-muted'>
        Hidden - due to licensing reasons, we can currently only provide sequences submitted by the D-BSSE,
        ETHZ. If you are a submitter to GISAID and are happy to give us the right to show your sequences here,
        please contact us!
      </i>
    );
  }
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

    getSamples(
      {
        mutationsString,
        matchPercentage,
        country,
      },
      signal
    ).then(response => {
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
    <>
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
            {totalNumber} samples have at least <b>{Math.round(matchPercentage * 100)}%</b> of the mutations.{' '}
            {samples && totalNumber && samples.length < totalNumber && samples.length + ' will be displayed.'}
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
                  <td>{formatMutations(sample)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </>
  );
};
