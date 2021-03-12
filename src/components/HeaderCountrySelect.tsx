import React from 'react';
import { Form } from 'react-bootstrap';
import { generatePath, Route, useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import { Country } from '../services/api-types';
import { RequiredCountrySelect } from './RequiredCountrySelect';

export const HeaderCountrySelect = () => {
  const match = useRouteMatch<{ country: string }>('/explore/:country');
  const location = useLocation();
  const history = useHistory();

  if (!match) {
    return null;
  }

  if (!location.pathname.startsWith(match.url)) {
    console.error(`match.url (${match.url}) is not a prefix of location.pathname (${location.pathname})`);
    return null;
  }

  const onCountrySelect = (country: Country) => {
    history.push({
      ...location,
      pathname: generatePath(match.path, { country }) + location.pathname.slice(match.url.length),
    });
  };

  return (
    <Route path='/explore'>
      <Form inline className='mr-3'>
        <Form.Label htmlFor='countrySelect' className='mr-2'>
          Country
        </Form.Label>
        <RequiredCountrySelect
          id='countrySelect'
          selected={match.params.country}
          onSelect={onCountrySelect}
        />
      </Form>
    </Route>
  );
};
