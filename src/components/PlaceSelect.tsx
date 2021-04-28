import React, { useEffect, useState } from 'react';
import { Typeahead } from 'react-bootstrap-typeahead';
import { getPlaces } from '../services/api';
import { Place } from '../services/api-types';

export interface Props {
  id?: string;
  selected: Place | undefined;
  onSelect: (country: Place | undefined) => void;
  onMenuToggle?: (show: boolean) => void;
}

export const PlaceSelect = ({ id, selected, onSelect, onMenuToggle }: Props) => {
  const [places, setPlaces] = useState<Place[]>([]);

  useEffect(() => {
    let isSubscribed = true;
    getPlaces().then(places => {
      if (isSubscribed) {
      
        setPlaces(places);
      }
    });
    return () => {
      isSubscribed = false;
    };
  }, []);

  return (
    <Typeahead
      id={id}
      selected={selected ? [selected] : []}
      placeholder='Select country/region'
      onChange={selected => onSelect(selected.length === 1 ? selected[0] : undefined)}
      onMenuToggle={onMenuToggle}
      options={places}
    />
  );
};
