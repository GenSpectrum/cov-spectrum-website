import React, { useState } from 'react';
import { Country } from '../services/api-types';
import { PlaceSelect } from './PlaceSelect';

export interface Props {
  id?: string;
  selected: Country;
  onSelect: (country: Country) => void;
}

export const RequiredPlaceSelect = ({ id, selected, onSelect }: Props) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [visuallySelected, setVisuallySelected] = useState<Country | undefined>(selected);

  return (
    <PlaceSelect
      id={id ? id : 'place-select'}
      selected={menuVisible ? visuallySelected : selected}
      onSelect={place => {
        setVisuallySelected(place);
        if (place) {
          onSelect(place);
        }
      }}
      onMenuToggle={show => {
        setMenuVisible(show);
        if (!show) {
          setVisuallySelected(undefined);
        }
      }}
    />
  );
};
