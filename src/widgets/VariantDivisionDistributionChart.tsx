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

const TableHeader = styled.th`
  font-weight: bolder;
  margin-top: 10px;
  &:hover,
  &:focus {
    color: #0276fd;
    cursor: pointer;
  }
`;

const sortOptions = ['division', 'count', 'prevalence'] as const;
type SortOptions = typeof sortOptions[number];

interface GeoSummary {
  division: string;
  count: number;
  prevalence: number;
}

const sortGeoTable = (entries: GeoSummary[], sortOption: SortOptions, ifAscendic: boolean): GeoSummary[] => {
  switch (sortOption) {
    case 'count':
      return ifAscendic
        ? entries.sort((a, b) => a.count - b.count)
        : entries.sort((a, b) => b.count - a.count);
    case 'prevalence':
      return ifAscendic
        ? entries.sort((a, b) => a.prevalence - b.prevalence)
        : entries.sort((a, b) => b.prevalence - a.prevalence);
    case 'division':
      return ifAscendic
        ? entries.sort((a, b) => (a.division > b.division ? 1 : b.division > a.division ? -1 : 0))
        : entries.sort((a, b) => (b.division > a.division ? 1 : a.division > b.division ? -1 : 0));
  }
};

export const VariantDivisionDistributionChart = ({
  variantSampleSet,
  wholeSampleSet,
}: VariantDivisionDistributionChartProps) => {
  const [geoOption, setGeoOption] = useState<string>('Countries');
  const [sortOption, setSortOption] = useState<SortOptions>('division');
  const [ifAscending, setIfAscending] = useState<boolean>(true);
  const [ifAscCount, setIfAscCount] = useState<boolean>(true);
  const [ifAscPrevalence, setIfAscPrevalence] = useState<boolean>(true);
  const [ifAscLocation, setIfAscLocation] = useState<boolean>(false);

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

  function handleGeoOptionChange(e: React.MouseEvent<HTMLElement>, option: string) {
    e.preventDefault();
    setGeoOption(option);
  }

  let aggDataArray = [];

  for (const [key, value] of aggregateGeo(geoOption, processedData).entries()) {
    let item = { division: key, count: value.count, prevalence: value.prevalence };
    aggDataArray.push(item);
  }

  let sortedAggData = sortGeoTable(aggDataArray, sortOption, ifAscending);

  function handleClick(target: string): void {
    switch (target) {
      case 'division':
        setSortOption('division');
        setIfAscLocation(!ifAscLocation);
        setIfAscending(ifAscLocation);
        sortedAggData = sortGeoTable(sortedAggData, 'division', ifAscending);
        break;
      case 'count':
        setSortOption('count');
        setIfAscCount(!ifAscCount);
        setIfAscending(ifAscCount);
        sortedAggData = sortGeoTable(sortedAggData, 'count', ifAscending);
        break;
      case 'prevalence':
        setSortOption('prevalence');
        setIfAscPrevalence(!ifAscPrevalence);
        setIfAscending(ifAscPrevalence);
        sortedAggData = sortGeoTable(sortedAggData, 'prevalence', ifAscending);
    }
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

  const granualityCountryOptions: JSX.Element = (
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
      {variantSampleSet.selector.location.country && country && !countriesWithMaps.includes(country) ? (
        <DropdownButton id='dropdown-basic-button' title={geoOption}>
          {granualityCountryOptions}
        </DropdownButton>
      ) : !country ? (
        <DropdownButton id='dropdown-basic-button' title={geoOption}>
          {granualityWorldOptions}
        </DropdownButton>
      ) : null}
      <br />

      {country && countriesWithMaps.includes(country) ? (
        <Map data={processedData} country={country} />
      ) : (
        <Wrapper>
          <Table striped bordered hover>
            <thead>
              <tr>
                <TableHeader
                  onClick={() => {
                    handleClick('division');
                  }}
                >
                  Location
                </TableHeader>
                <TableHeader
                  onClick={() => {
                    handleClick('count');
                  }}
                >
                  Number of sequences
                </TableHeader>
                <TableHeader
                  onClick={() => {
                    handleClick('prevalence');
                  }}
                >
                  Prevalence
                </TableHeader>
              </tr>
            </thead>
            <tbody>
              {sortedAggData.map(({ division, count, prevalence }) => (
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
