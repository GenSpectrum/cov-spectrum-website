import { useLocation } from 'react-router-dom';
import { screen } from '@testing-library/react';

const LOCATION_DISPLAY_ID = 'location-display';

export function LocationDisplay() {
  const currentLocation = useLocation();
  return (
    <div data-testid={LOCATION_DISPLAY_ID}>
      {currentLocation.pathname + currentLocation.search + currentLocation.hash}
    </div>
  );
}

export function getLocationDisplay() {
  return screen.getByTestId(LOCATION_DISPLAY_ID);
}
