import React, { useState } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import ReactCountryFlag from 'react-country-flag';
import { LocationService } from '../services/LocationService';
import { useQuery } from '../helpers/query-hook';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';

export interface Props {
  id?: string;
  selected: string | undefined;
  onSelect: (country: string | undefined) => void;
  onMenuToggle: (show: boolean) => void;
}

export const PlaceSelect = ({ id, selected, onSelect, onMenuToggle }: Props) => {
  const places: string[] = useQuery(() => LocationService.getAllLocationNames(), []).data ?? [];
  const [geoOption, setGeoOption] = useState<string>('Countries');

  const world: string[] = ['World'];
  const regions: string[] = ['Africa', 'Asia', 'Europe', 'North America', 'Oceania', 'South America'];

  let filteredPlaces: string[] = [];

  function handleGeoOptionChange(e: React.MouseEvent<HTMLElement>, option: string) {
    e.preventDefault();
    setGeoOption(option);
  }

  switch (geoOption) {
    case 'Regions':
      filteredPlaces = places.filter(place => regions.includes(place));
      break;
    case 'World':
      filteredPlaces = places.filter(place => world.includes(place));
      break;
    case 'Countries':
      filteredPlaces = places.filter(place => !world.includes(place) && !regions.includes(place));
  }

  return (
    <div className='flex space-x-4'>
      <Typeahead
        id={id ? id : 'typeahead'}
        selected={selected ? [selected] : []}
        placeholder='Select country/region'
        onChange={selected => onSelect(selected.length === 1 ? selected[0] : undefined)}
        onMenuToggle={onMenuToggle}
        options={filteredPlaces}
        maxResults={places.length + 100} // +100 is just to be safe...
        paginate={false}
      >
        {getFlag(selected)}
      </Typeahead>

      <DropdownButton id='dropdown-basic-button' title={geoOption}>
        <Dropdown.Item onClick={(e: React.MouseEvent<HTMLElement>) => handleGeoOptionChange(e, 'World')}>
          World
        </Dropdown.Item>
        <Dropdown.Item onClick={(e: React.MouseEvent<HTMLElement>) => handleGeoOptionChange(e, 'Regions')}>
          Regions
        </Dropdown.Item>
        <Dropdown.Item onClick={(e: React.MouseEvent<HTMLElement>) => handleGeoOptionChange(e, 'Countries')}>
          Countries
        </Dropdown.Item>
      </DropdownButton>
    </div>
  );
};

const getFlag = (countryName: string | undefined) => {
  if (countryName) {
    const code = LocationService.getIsoAlpha2Code(countryName);
    if (code) {
      return <ReactCountryFlag className='rbt-aux h-full w-10 pr-3' countryCode={code} svg />;
    }
  }
};
