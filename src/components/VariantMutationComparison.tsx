import { LocationDateVariantSelector } from '../data/LocationDateVariantSelector';
import { useQuery } from '../helpers/query-hook';
import { MutationProportionData } from '../data/MutationProportionDataset';
import Loader from './Loader';
import React, { useEffect, useMemo } from 'react';
import { ReferenceGenomeService } from '../services/ReferenceGenomeService';
import _ from 'lodash';
import Table from 'react-bootstrap/Table';
import { formatVariantDisplayName } from '../data/VariantSelector';
import ReactTooltip from 'react-tooltip';

export interface Props {
  selectors: LocationDateVariantSelector[];
}

const minProportion = 0.5;

export const VariantMutationComparison = ({ selectors }: Props) => {
  const res = useQuery(
    signal => Promise.all(selectors.map(selector => MutationProportionData.fromApi(selector, 'aa', signal))),
    [selectors],
    useEffect
  );

  const data = useMemo(() => {
    if (!res.data || res.data.length !== 2) {
      return undefined;
    }
    // Find shared and non-shared mutations
    const [variant1, variant2] = res.data;
    const variant1Mutations = variant1.payload.map(({ mutation }) => mutation);
    const variant2Mutations = variant2.payload.map(({ mutation }) => mutation);
    const shared = _.intersection(variant1Mutations, variant2Mutations);
    const onlyVariant1 = _.pullAll(variant1Mutations, shared);
    const onlyVariant2 = _.pullAll(variant2Mutations, shared);
    // Group by genes
    const genes = new Map<
      string,
      {
        onlyVariant1: string[];
        onlyVariant2: string[];
        shared: string[];
      }
    >();
    for (let gene of ReferenceGenomeService.genes) {
      genes.set(gene, { onlyVariant1: [], onlyVariant2: [], shared: [] });
    }
    for (let mutation of shared) {
      genes.get(mutation.split(':')[0])!.shared.push(mutation);
    }
    for (let mutation of onlyVariant1) {
      genes.get(mutation.split(':')[0])!.onlyVariant1.push(mutation);
    }
    for (let mutation of onlyVariant2) {
      genes.get(mutation.split(':')[0])!.onlyVariant2.push(mutation);
    }
    // Count
    return [...genes.entries()].map(([gene, muts]) => ({
      gene,
      ...muts,
    }));
  }, [res.data]);

  if (selectors.length !== 2) {
    throw new Error(
      `<VariantMutationComparison> is used with ${selectors.length} variants, ` +
        'but it only supports comparisons of 2 variants.'
    );
  }
  if (res.isError) {
    throw new Error('Data fetching failed: ' + JSON.stringify(res.error));
  }
  if (res.isLoading || !res.data || !data) {
    return <Loader />;
  }

  return (
    <>
      <div>
        A mutation is considered as belonging to a variant if at least{' '}
        <b>{(minProportion * 100).toFixed(0)}%</b> of the samples of the variant have the mutation. Please
        note that we currently <b>do not</b> exclude the unknowns when calculating the proportions.
      </div>
      <div>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Gene</th>
              <th>Only {formatVariantDisplayName(selectors[0].variant!)}</th>
              <th>Shared</th>
              <th>Only {formatVariantDisplayName(selectors[1].variant!)}</th>
            </tr>
          </thead>
          <tbody>
            {data.map(({ gene, onlyVariant1, onlyVariant2, shared }) => (
              <tr key={gene}>
                <td>{gene}</td>
                <td data-for={`${gene}-variant1`} data-tip>
                  {onlyVariant1.length}
                </td>
                <td data-for={`${gene}-shared`} data-tip>
                  {shared.length}
                </td>
                <td data-for={`${gene}-variant2`} data-tip>
                  {onlyVariant2.length}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        {data.map(({ gene, onlyVariant1, onlyVariant2, shared }) => (
          <>
            <ReactTooltip id={`${gene}-variant1`} key={`${gene}-variant1`}>
              {simpleMutationListFormat(onlyVariant1)}
            </ReactTooltip>
            <ReactTooltip id={`${gene}-shared`} key={`${gene}-shared`}>
              {simpleMutationListFormat(shared)}
            </ReactTooltip>
            <ReactTooltip id={`${gene}-variant2`} key={`${gene}-variant2`}>
              {simpleMutationListFormat(onlyVariant2)}
            </ReactTooltip>
          </>
        ))}
      </div>
    </>
  );
};

function simpleMutationListFormat(mutations: string[]): JSX.Element {
  // Up to five mutations shall be shown on a line.
  let currentLine: string[] = [];
  const lines: string[][] = [currentLine];
  for (let mutation of mutations) {
    currentLine.push(mutation);
    if (currentLine.length >= 5) {
      currentLine = [];
      lines.push(currentLine);
    }
  }
  return (
    <>
      {lines.map((line, index) => (
        <div key={index}>{line.join(', ')}</div>
      ))}
    </>
  );
}
