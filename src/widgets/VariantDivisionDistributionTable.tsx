import { SampleSetWithSelector } from '../helpers/sample-set';
import { useMemo } from 'react';
import { Widget } from './Widget';
import { AsyncZodQueryEncoder } from '../helpers/query-encoder';
import * as zod from 'zod';
import { NewSampleSelectorSchema } from '../helpers/sample-selector';
import { omit } from 'lodash';
import { getNewSamples } from '../services/api';
import Table from 'react-bootstrap/Table';
import styled from 'styled-components';

interface Props {
  variantSampleSet: SampleSetWithSelector;
  wholeSampleSet: SampleSetWithSelector;
}

const Wrapper = styled.div`
  overflow-y: auto;
  height: 300px;
`;

const VariantDivisionDistributionTable = ({ variantSampleSet, wholeSampleSet }: Props) => {
  const processedData = useMemo(() => variantSampleSet.proportionByField('division', wholeSampleSet), [
    variantSampleSet,
    wholeSampleSet,
  ]);

  return (
    <Wrapper>
      <Table striped bordered hover>
        <tbody>
          {Array.from(processedData.entries())
            .sort((a, b) => {
              if (!a[0]) {
                return 1;
              }
              if (!b[0]) {
                return -1;
              }
              return a[0] > b[0] ? 1 : -1;
            })
            .map(([division, value]) => (
              <tr>
                <td>{division || 'Unknown'}</td>
                <td>{value.count}</td>
              </tr>
            ))}
        </tbody>
      </Table>
    </Wrapper>
  );
};

export const VariantDivisionDistributionTableWidget = new Widget(
  new AsyncZodQueryEncoder(
    zod.object({
      variantSampleSelector: NewSampleSelectorSchema,
      wholeSampleSelector: NewSampleSelectorSchema,
    }),
    async (decoded: Props) => ({
      ...omit(decoded, ['variantSampleSet', 'wholeSampleSet']),
      variantSampleSelector: decoded.variantSampleSet.sampleSelector,
      wholeSampleSelector: decoded.wholeSampleSet.sampleSelector,
    }),
    async (encoded, signal) => ({
      ...omit(encoded, ['variantSampleSelector', 'wholeSampleSelector']),
      variantSampleSet: await getNewSamples(encoded.variantSampleSelector, signal),
      wholeSampleSet: await getNewSamples(encoded.wholeSampleSelector, signal),
    })
  ),
  VariantDivisionDistributionTable,
  'VariantDivisionDistributionTable'
);
