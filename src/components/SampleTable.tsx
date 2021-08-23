import React, { useEffect, useState } from 'react';
import { Overlay, Popover, Table } from 'react-bootstrap';
import { getSamples, PromiseWithCancel, SamplingStrategy, toLiteralSamplingStrategy } from '../services/api';
import { Country, Sample, SampleResultList, Variant } from '../services/api-types';
import { useQuery } from 'react-query';
import Loader from './Loader';
import { Alert, AlertVariant } from "../helpers/ui";

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

function formatMutations(sample: Sample): React.ReactChild {
  if (sample.mutations) {
    return sample.mutations.join(', ');
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
  samplingStrategy: SamplingStrategy;
}

// SampleTable shows detailed information about individual samples from GISAID
export const SampleTable = ({ matchPercentage, variant, country, samplingStrategy }: Props) => {
  const mutationsString = variant.mutations.join(',');
  const { isLoading, isSuccess, error, isError, data: samples, refetch, isFetching } = useQuery<
    SampleResultList,
    Error
  >('caseCounts', () => {
    const controller = new AbortController();
    const signal = controller.signal;
    const promise = getSamples(
      {
        pangolinLineage: variant.name,
        mutationsString,
        matchPercentage,
        country,
        samplingStrategy: toLiteralSamplingStrategy(samplingStrategy),
      },
      signal
    );
    (promise as PromiseWithCancel<SampleResultList>).cancel = () => controller.abort();
    return promise;
  });

  useEffect(() => {
    if (!isFetching) {
      refetch();
    }
    // eslint-disable-next-line
  }, [matchPercentage, variant.name, variant.mutations, country, samplingStrategy]);

  const [popoverTarget, setPopoverTarget] = useState<PopoverTarget>();
  useEffect(() => {
    if (popoverTarget && !samples?.data?.includes(popoverTarget.sample)) {
      setPopoverTarget(undefined);
    }
  }, [samples?.data, popoverTarget]);

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

      {(isLoading || isFetching) && <Loader />}
      {isError && error &&
        <Alert variant={AlertVariant.DANGER}>{error.message}</Alert>}

      {isSuccess && samples?.data && (
        <>
          {variant.mutations.length > 0 && (
            <p>
              {samples?.total} samples have at least <b>{Math.round(matchPercentage * 100)}%</b> of the
              mutations.{' '}
              {samples.data &&
                samples.total &&
                samples.data.length < samples.total &&
                samples.data.length + ' will be displayed.'}
            </p>
          )}

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
              {samples?.data.map(sample => (
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
