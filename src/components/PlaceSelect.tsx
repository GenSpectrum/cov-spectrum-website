import React, { Fragment, useState, useEffect } from 'react';
import { getLocation } from '../helpers/get-location';
import { LocationService } from '../services/LocationService';
import { useQuery } from '../helpers/query-hook';
import { Autocomplete, Box, TextField } from '@mui/material';
import { useExploreUrl } from '../helpers/explore-url';
export interface Props {
  id?: string;
  selected: string | undefined;
  onSelect: (country: string | undefined) => void;
  onMenuToggle: (show: boolean) => void;
}

export const PlaceSelect = ({ onSelect }: Props) => {
  const exploreUrl = useExploreUrl();
  const [value, setValue] = useState<string | null>('');

  useEffect(() => {
    let place: string = getLocation(exploreUrl);
    setValue(place);
  });

  const places: string[] = useQuery(() => LocationService.getAllLocationNames(), []).data ?? [];

  const regions: string[] = ['Africa', 'Asia', 'Europe', 'North America', 'Oceania', 'South America'];
  let countries: string[] = places
    .filter(place => place !== 'Switzerland' && place !== 'World' && !regions.includes(place))
    .sort();

  const geoOptions: { group: string; place: string; code?: string }[] = [{ group: 'World', place: 'World' }];

  for (const region of regions) {
    geoOptions.push({ group: 'Regions', place: region });
  }
  geoOptions.push({
    group: 'Countries',
    place: 'Switzerland',
    code: 'CH',
  });

  for (const country of countries) {
    geoOptions.push({ group: 'Countries', place: country, code: LocationService.getIsoAlpha2Code(country) });
  }

  return (
    <>
      <Autocomplete
        placeholder={
          [...new Set(geoOptions)].filter(x => x.place === value)[0]
            ? [...new Set(geoOptions)].filter(x => x.place === value)[0].place
            : ''
        }
        autoComplete
        includeInputInList
        value={[...new Set(geoOptions)].filter(x => x.place === value)[0]}
        defaultValue={[...new Set(geoOptions)].filter(x => x.place === value)[0]}
        isOptionEqualToValue={(option, value) => option.place === value.place}
        size='small'
        sx={{ mr: 1, minWidth: 250 }}
        id='grouped-demo'
        options={[...new Set(geoOptions)]}
        groupBy={option => option.group}
        getOptionLabel={option => option.place}
        onChange={(event: any, newValue: any) => {
          if (newValue !== null && newValue.place) {
            setValue(newValue.place);
            onSelect(newValue.place);
          }
        }}
        renderInput={params => (
          <TextField
            placeholder={
              [...new Set(geoOptions)].filter(x => x.place === value)[0]
                ? [...new Set(geoOptions)].filter(x => x.place === value)[0].place
                : ''
            }
            variant='standard'
            {...params}
            inputProps={{
              ...params.inputProps,
            }}
          />
        )}
        renderOption={(props, option) => (
          <Box component='li' {...props} sx={{ '& > img': { flexShrink: 0 } }}>
            {option.code && option.group === 'Countries' ? (
              <>
                <img
                  loading='lazy'
                  width='20'
                  src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                  srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
                  alt=''
                  className='mr-3 pl-0 ml-0'
                />{' '}
                <span>{option.place}</span>
              </>
            ) : !option.code && option.group === 'Countries' ? (
              <p style={{ marginLeft: '20px' }}>
                <span>{option.place}</span>
              </p>
            ) : (
              <span>{option.place}</span>
            )}
          </Box>
        )}
      />
    </>
  );
};
