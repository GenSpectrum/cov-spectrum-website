import React, { Fragment } from 'react';
import ReactCountryFlag from 'react-country-flag';
import { LocationService } from '../services/LocationService';
import { useQuery } from '../helpers/query-hook';
import { FormControl, InputLabel, ListSubheader, MenuItem, Select } from '@mui/material';

export interface Props {
  id?: string;
  selected: string | undefined;
  onSelect: (country: string | undefined) => void;
  onMenuToggle: (show: boolean) => void;
}

export const PlaceSelect = ({ onSelect }: Props) => {
  const places: string[] = useQuery(() => LocationService.getAllLocationNames(), []).data ?? [];

  const world: string[] = ['World'];
  const regions: string[] = ['Africa', 'Asia', 'Europe', 'North America', 'Oceania', 'South America'];
  let countries: string[] = ['Switzerland'];

  for (const place of places) {
    if (!world.includes(place) && !regions.includes(place) && place !== 'Switzerland') {
      countries.push(place);
    }
  }
  countries = countries.sort();

  return (
    <>
      <FormControl sx={{ m: 1, minWidth: 230 }}>
        <InputLabel id='simple-select-label'>Location</InputLabel>
        <Select
          labelId='simple-select-label'
          defaultValue='Switzerland'
          id='grouped-select'
          onChange={e => onSelect(e.target.value)}
          style={{ height: '35px' }}
          label='Location'
        >
          <MenuItem value={'World'}>World</MenuItem>
          <ListSubheader>Regions</ListSubheader>
          {regions.map((region, index) => (
            <MenuItem value={region} key={index}>
              {region}
            </MenuItem>
          ))}
          <ListSubheader>Countries</ListSubheader>
          {countries.map((country, index) => (
            <MenuItem value={country} key={index + regions.length}>
              {getFlag(country)}
              {'  '}
              {country}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
};

const getFlag = (countryName: string | undefined) => {
  if (countryName) {
    const code = LocationService.getIsoAlpha2Code(countryName);
    if (code) {
      return <ReactCountryFlag className='rbt-aux h-full w-10 pr-3 mr-5' countryCode={code} svg />;
    }
  }
};
