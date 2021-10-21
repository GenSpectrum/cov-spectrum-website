import React, { useState } from 'react';
import { PlaceSelect } from './PlaceSelect';
import {
  decodeLocationSelectorFromSingleString,
  encodeLocationSelectorToSingleString,
  LocationSelector,
} from '../data/LocationSelector';

export interface Props {
  id?: string;
  selected: LocationSelector;
  onSelect: (location: LocationSelector) => void;
}

export const RequiredPlaceSelect = ({ id, selected, onSelect }: Props) => {
  const locationString = encodeLocationSelectorToSingleString(selected);
  const [menuVisible, setMenuVisible] = useState(false);
  const [visuallySelected, setVisuallySelected] = useState<string | undefined>(locationString);

  return (
    <PlaceSelect
      id={id ? id : 'place-select'}
      selected={menuVisible ? visuallySelected : locationString}
      onSelect={place => {
        setVisuallySelected(place);
        if (place) {
          onSelect(decodeLocationSelectorFromSingleString(place));
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
