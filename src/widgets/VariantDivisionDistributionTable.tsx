import { SampleSetWithSelector } from '../helpers/sample-set';
import React, { useMemo } from 'react';
import { Widget } from './Widget';
import { AsyncZodQueryEncoder } from '../helpers/query-encoder';
import * as zod from 'zod';
import { NewSampleSelectorSchema } from '../helpers/sample-selector';
import { omit } from 'lodash';
import { getNewSamples } from '../services/api';
import Table from 'react-bootstrap/Table';
import styled from 'styled-components';
import DownloadWrapper from '../charts/DownloadWrapper';
import Map from '../maps/Map';

interface Props {
  variantSampleSet: SampleSetWithSelector;
  wholeSampleSet: SampleSetWithSelector;
}

const Wrapper = styled.div`
  overflow-y: auto;
  height: 300px;
`;

const VariantDivisionDistributionTable = ({ variantSampleSet, wholeSampleSet }: Props) => {
  const processedData = useMemo(() => {
    const variantDivisions = variantSampleSet.proportionByField('division', wholeSampleSet);
    const wholeDivisions = wholeSampleSet.proportionByField('division', wholeSampleSet);
    const plotData: {
      division: string | null;
      count: number;
      prevalence?: number;
    }[] = [...variantDivisions.entries()]
      .sort((a, b) => {
        if (!a[0]) {
          return 1;
        }
        if (!b[0]) {
          return -1;
        }
        return a[0] > b[0] ? 1 : -1;
      })
      .map(([division, value]) => {
        const whole = wholeDivisions.get(division);
        return {
          division,
          count: value.count,
          prevalence: whole ? value.count / whole.count : undefined,
        };
      });
    return plotData;
  }, [variantSampleSet, wholeSampleSet]);
  const csvData = processedData.map(({ division, prevalence, count }) => ({
    division,
    numberSamples: count,
    proportionWithinDivision: prevalence?.toFixed(6),
  }));

  return (
    <DownloadWrapper name='VariantDivisionDistributionTable' csvData={csvData}>
      <Map data={processedData} />
      <Wrapper>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Division</th>
              <th>Number of sequences</th>
              <th>Prevalence</th>
            </tr>
          </thead>
          <tbody>
            {processedData.map(({ division, count, prevalence }) => (
              <tr key={division}>
                <td>{division ?? 'Unknown'}</td>
                <td>{count}</td>
                <td>{prevalence ? (prevalence * 100).toFixed(2) + '%' : '-'}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Wrapper>
    </DownloadWrapper>
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
