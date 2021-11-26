import DownloadWrapper from './DownloadWrapper';
import Map from '../maps/Map';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import Table from 'react-bootstrap/Table';
import {
  DivisionCountSampleData,
  DivisionCountSampleDataset,
} from '../data/sample/DivisionCountSampleDataset';

export type VariantDivisionDistributionChartProps = {
  variantSampleSet: DivisionCountSampleDataset;
  wholeSampleSet: DivisionCountSampleDataset;
};

const Wrapper = styled.div`
  overflow-y: auto;
  height: 300px;
`;

const countriesWithMaps = [
  'Brazil',
  'China',
  'France',
  'Germany',
  'Italy',
  'Japan',
  'Spain',
  'Switzerland',
  'United States',
  'South Africa',
];

export const VariantDivisionDistributionChart = ({
  variantSampleSet,
  wholeSampleSet,
}: VariantDivisionDistributionChartProps) => {
  const country = wholeSampleSet.selector.location.country;
  const processedData = useMemo(() => {
    const variantDivisions = DivisionCountSampleData.proportionByDivision(
      variantSampleSet.payload,
      wholeSampleSet.payload
    );
    const wholeDivisions = DivisionCountSampleData.proportionByDivision(
      wholeSampleSet.payload,
      wholeSampleSet.payload
    );
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
    <DownloadWrapper name='VariantDivisionDistributionChart' csvData={csvData}>
      {country && countriesWithMaps.includes(country) ? (
        <Map data={processedData} country={country} />
      ) : (
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
      )}
    </DownloadWrapper>
  );
};
