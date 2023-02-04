import { useQuery } from '../helpers/query-hook';
import { MutationProportionData } from '../data/MutationProportionDataset';
import Loader from './Loader';
import React, { useEffect, useMemo, useState } from 'react';
import { ReferenceGenomeService } from '../services/ReferenceGenomeService';
import Table from 'react-bootstrap/Table';
import { formatVariantDisplayName } from '../data/VariantSelector';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import Slider from 'rc-slider';
import { sortAAMutationList } from '../helpers/aa-mutation';
import { LapisSelector } from '../data/LapisSelector';
import { pullAll } from '../helpers/lodash_alternatives';

export interface Props {
  selectors: LapisSelector[];
}

export const VariantMutationComparison = ({ selectors }: Props) => {
  const [minProportion, setMinProportion] = useState(0.5);

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
    const variant1Mutations = variant1.payload
      .filter(m => m.proportion >= minProportion)
      .map(m => m.mutation);
    const variant2Mutations = variant2.payload
      .filter(m => m.proportion >= minProportion)
      .map(m => m.mutation);
    const shared = [variant1Mutations, variant2Mutations].reduce((a, b) => a.filter(c => b.includes(c)));
    const onlyVariant1 = pullAll(variant1Mutations, shared);
    const onlyVariant2 = pullAll(variant2Mutations, shared);
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
  }, [res.data, minProportion]);

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
        <OverlayTrigger
          trigger='click'
          overlay={
            <Tooltip id='mutationMinProportion'>
              <div>
                <Slider
                  value={Math.round(minProportion * 100)}
                  min={5}
                  max={100}
                  step={5}
                  onChange={value => setMinProportion((value as number) / 100)}
                  style={{ width: '100px' }}
                />
              </div>
            </Tooltip>
          }
          rootClose={true}
          placement='bottom'
        >
          <span className='cursor-pointer px-3 rounded bg-gray-100 hover:bg-gray-300 font-bold'>
            {(minProportion * 100).toFixed(0)}%
          </span>
        </OverlayTrigger>{' '}
        of the samples of the variant have the mutation.
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
  for (let mutation of sortAAMutationList(mutations)) {
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
