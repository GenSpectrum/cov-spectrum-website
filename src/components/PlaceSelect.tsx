import React from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import ReactCountryFlag from 'react-country-flag';
import { LocationService } from '../services/LocationService';
import { useQuery } from '../helpers/query-hook';

export interface Props {
  id?: string;
  selected: string | undefined;
  onSelect: (country: string | undefined) => void;
  onMenuToggle: (show: boolean) => void;
}

export const PlaceSelect = ({ id, selected, onSelect, onMenuToggle }: Props) => {
  const places: string[] = useQuery(() => LocationService.getAllLocationNames(), []).data ?? [];

  return (
    <>
      <Typeahead
        id={id ? id : 'typeahead'}
        selected={selected ? [selected] : []}
        placeholder='Select country/region'
        onChange={selected => onSelect(selected.length === 1 ? selected[0] : undefined)}
        onMenuToggle={onMenuToggle}
        options={places}
        maxResults={places.length + 100} // +100 is just to be safe...
        paginate={false}
      >
        {getFlag(selected)}
      </Typeahead>
    </>
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
