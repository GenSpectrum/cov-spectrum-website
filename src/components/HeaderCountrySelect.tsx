import React from 'react';
import { Form } from 'react-bootstrap';
import { useExploreUrl } from '../helpers/explore-url';
import { RequiredPlaceSelect } from './RequiredPlaceSelect';
import styled from 'styled-components';
import { colors } from '../charts/common';

const Wrapper = styled.div`
  & .rbt-input-main {
    color: ${colors.bright};
    border-width: 2px;
    border-color: ${colors.bright2};
    font-weight: bold;
  }
  
  &:hover .rbt-input-main {
    color: ${colors.active};
    border-color: ${colors.active};
  }
  & .rbt-input-hint {
    border-color: black;
    font-weight: bold;
  }
`;

export const HeaderCountrySelect = () => {
  const exploreUrl = useExploreUrl();

  if (!exploreUrl) {
    return null;
  }

  return (
    <Form inline className='mr-3'>
      <Wrapper>
        <RequiredPlaceSelect
          id='countrySelect'
          selected={exploreUrl.country}
          onSelect={exploreUrl.setCountry}
        />
      </Wrapper>
    </Form>
  );
};
