import DownloadWrapper from './DownloadWrapper';
import Map from '../maps/Map';
import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import Table from 'react-bootstrap/Table';
import {
  DivisionCountSampleData,
  DivisionCountSampleDataset,
} from '../data/sample/DivisionCountSampleDataset';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import { aggregateGeo } from '../helpers/geoAgg';

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
  'Botswana',
];

export const VariantDivisionDistributionChart = ({
  variantSampleSet,
  wholeSampleSet,
}: VariantDivisionDistributionChartProps) => {
  const country = wholeSampleSet.selector.location.country;

  const processedData = useMemo(() => {
    const geoData = DivisionCountSampleData.proportionByDivision(
      variantSampleSet.payload,
      wholeSampleSet.payload
    ).geoInfoArray;

    const variantDivisions = DivisionCountSampleData.proportionByDivision(
      variantSampleSet.payload,
      wholeSampleSet.payload
    ).divisionData;

    const wholeDivisions = DivisionCountSampleData.proportionByDivision(
      wholeSampleSet.payload,
      wholeSampleSet.payload
    ).divisionData;

    const plotData: {
      division: string | null;
      count: number;
      prevalence?: number;
      country: string | null;
      region: string | null;
    }[] = [...variantDivisions.entries()]
      .map(([division, value], index) => {
        const whole = wholeDivisions.get(division);
        return {
          division,
          count: value.count,
          prevalence: whole ? value.count / whole.count : undefined,
          country: geoData[index].country,
          region: geoData[index].region,
        };
      })
      .sort((a, b) => {
        if (!a.division[0]) {
          return 1;
        }
        if (!b.division[0]) {
          return -1;
        }
        return a.division[0] > b.division[0] ? 1 : -1;
      });
    return plotData;
  }, [variantSampleSet, wholeSampleSet]);

  const csvData = processedData.map(({ division, prevalence, count }) => ({
    division,
    numberSamples: count,
    proportionWithinDivision: prevalence?.toFixed(6),
  }));

  const [geoOption, setGeoOption] = useState<string>('Regions');
  function handleGeoOptionChange(e: React.MouseEvent<HTMLElement>, option: string) {
    e.preventDefault();
    setGeoOption(option);
  }

  let aggDataArray = [];

  for (const [key, value] of aggregateGeo(geoOption, processedData).entries()) {
    let item = { division: key, count: value.count, prevalence: value.prevalence };
    aggDataArray.push(item);
  }

  const granualityWorldOptions: JSX.Element = (
    <>
      <Dropdown.Item onClick={(e: React.MouseEvent<HTMLElement>) => handleGeoOptionChange(e, 'Regions')}>
        Regions
      </Dropdown.Item>
      <Dropdown.Item onClick={(e: React.MouseEvent<HTMLElement>) => handleGeoOptionChange(e, 'Countries')}>
        Countries
      </Dropdown.Item>
      <Dropdown.Item onClick={(e: React.MouseEvent<HTMLElement>) => handleGeoOptionChange(e, 'Divisions')}>
        Divisions
      </Dropdown.Item>
    </>
  );

  const granualityRegionOptions: JSX.Element = (
    <>
      <Dropdown.Item onClick={(e: React.MouseEvent<HTMLElement>) => handleGeoOptionChange(e, 'Countries')}>
        Countries
      </Dropdown.Item>
      <Dropdown.Item onClick={(e: React.MouseEvent<HTMLElement>) => handleGeoOptionChange(e, 'Divisions')}>
        Divisions
      </Dropdown.Item>
    </>
  );

  return (
    <DownloadWrapper name='VariantDivisionDistributionChart' csvData={csvData}>
      {variantSampleSet.selector.location.country ? null : (
        <DropdownButton id='dropdown-basic-button' title='Granuality'>
          {variantSampleSet.selector.location.region ? granualityRegionOptions : granualityWorldOptions}
        </DropdownButton>
      )}
      <br />
      {country && countriesWithMaps.includes(country) ? (
        <Map data={processedData} country={country} />
      ) : (
        <Wrapper>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Location</th>
                <th>Number of sequences</th>
                <th>Prevalence</th>
              </tr>
            </thead>
            <tbody>
              {geoOption === 'Divisions' || country
                ? processedData.map(({ division, count, prevalence }) => (
                    <tr key={division}>
                      <td>{division ?? 'Unknown'}</td>
                      <td>{count}</td>
                      <td>{prevalence ? Math.ceil(prevalence * 100 * 1000) / 1000 + '%' : '-'}</td>
                    </tr>
                  ))
                : aggDataArray.map(({ division, count, prevalence }) => (
                    <tr key={division}>
                      <td>{division ?? 'Unknown'}</td>
                      <td>{count}</td>
                      <td>{prevalence ? Math.ceil(prevalence * 100 * 1000) / 1000 + '%' : '-'}</td>
                    </tr>
                  ))}
            </tbody>
          </Table>
        </Wrapper>
      )}
    </DownloadWrapper>
  );
};
