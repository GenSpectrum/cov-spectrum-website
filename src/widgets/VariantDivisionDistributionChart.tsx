import DownloadWrapper from './DownloadWrapper';
import MapComponent from '../maps/Map';
import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { DivisionCountSampleDataset } from '../data/sample/DivisionCountSampleDataset';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import { LocationField, locationFields } from '../data/LocationSelector';
import { Utils } from '../services/Utils';
import _ from 'lodash';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

export type VariantDivisionDistributionChartProps = {
  variantSampleSet: DivisionCountSampleDataset;
  wholeSampleSet: DivisionCountSampleDataset;
};

const Wrapper = styled.div`
  overflow-y: auto;
  height: 400px;
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

interface GeoSummary {
  id: number; // The ID is used for the MUI DataGrid
  location: string;
  count: number;
  prevalence: number;
}

const tableColumns: GridColDef[] = [
  { field: 'location', headerName: 'Location', minWidth: 250 },
  { field: 'count', headerName: 'Number of sequences', minWidth: 200 },
  {
    field: 'prevalence',
    headerName: 'Prevalence',
    minWidth: 100,
    valueFormatter: params => (params.value * 100).toFixed(3) + '%',
  },
];

export const VariantDivisionDistributionChart = ({
  variantSampleSet,
  wholeSampleSet,
}: VariantDivisionDistributionChartProps) => {
  const country = wholeSampleSet.selector.location.country;
  const [selectedLocationField, setSelectedLocationField] = useState<LocationField>(
    !country ? 'country' : 'division'
  );

  const geoSummariesMap = useMemo(() => {
    const geoSummariesMap = new Map<LocationField, GeoSummary[]>();
    locationFields.forEach(locationField => {
      const variantGrouped = Utils.groupBy(variantSampleSet.payload, x => x[locationField]);
      const wholeGrouped = Utils.groupBy(wholeSampleSet.payload, x => x[locationField]);
      const geoSummaries: GeoSummary[] = [];
      let index = 0;
      for (const [location, entries] of variantGrouped.entries()) {
        if (!location) {
          continue;
        }
        const variantCount = entries.reduce((prev, curr) => prev + curr.count, 0);
        const wholeCount = wholeGrouped.get(location)!.reduce((prev, curr) => prev + curr.count, 0);
        geoSummaries.push({
          id: index++, // Creating an ID because the MUI DataGrid needs one
          location,
          count: variantCount,
          prevalence: variantCount / wholeCount,
        });
      }
      geoSummariesMap.set(locationField, geoSummaries);
    });
    return geoSummariesMap;
  }, [variantSampleSet, wholeSampleSet]);

  const selectedGeoSummaries = useMemo(
    () => _.sortBy(geoSummariesMap.get(selectedLocationField)!, x => x.location),
    [geoSummariesMap, selectedLocationField]
  );

  const csvData = useMemo(
    // Gets rid of the id column and improve column naming
    () =>
      selectedGeoSummaries.map(({ location, count, prevalence }) => ({
        [selectedLocationField]: location,
        count,
        prevalence,
      })),
    [selectedLocationField, selectedGeoSummaries]
  );

  // Used for the division map
  const mapData = useMemo(
    () =>
      geoSummariesMap.get('division')!.map(({ location, count, prevalence }) => ({
        division: location,
        count,
        prevalence,
      })),
    [geoSummariesMap]
  );

  const locationFieldLabels = {
    region: 'Regions',
    country: 'Countries',
    division: 'Divisions',
  };

  return (
    <DownloadWrapper name='GeographicDistribution' csvData={csvData}>
      {country && countriesWithMaps.includes(country) ? (
        <MapComponent data={mapData} country={country} />
      ) : (
        <Wrapper>
          {!country && (
            <DropdownButton
              id='dropdown-basic-button'
              title={locationFieldLabels[selectedLocationField]}
              className='mb-3'
            >
              {locationFields.map(field =>
                !wholeSampleSet.selector.location[field] ? (
                  <Dropdown.Item onClick={() => setSelectedLocationField(field)}>
                    {locationFieldLabels[field]}
                  </Dropdown.Item>
                ) : (
                  <></>
                )
              )}
            </DropdownButton>
          )}
          {/* TODO The MUI DataGrid (in the free version) is quite limited and thus not the best choice here */}
          <DataGrid
            columns={tableColumns}
            rows={selectedGeoSummaries}
            autoHeight={true}
            rowsPerPageOptions={[100, 200, 500]}
          />
        </Wrapper>
      )}
    </DownloadWrapper>
  );
};
