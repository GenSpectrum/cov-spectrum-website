import React, { useState } from 'react';
import { Country } from '../services/api-types';
import { CountrySelect } from './CountrySelect';

export interface Props {
  id?: string;
  selected: Country;
  onSelect: (country: Country) => void;
}

export const RequiredCountrySelect = ({ id, selected, onSelect }: Props) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [visuallySelected, setVisuallySelected] = useState<Country | undefined>(selected);

  return (
    <CountrySelect
      id={id}
      selected={menuVisible ? visuallySelected : selected}
      onSelect={country => {
        setVisuallySelected(country);
        if (country) {
          onSelect(country);
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
