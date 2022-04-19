import React from 'react';
import { Form } from 'react-bootstrap';
import { useExploreUrl } from '../helpers/explore-url';
import { RequiredPlaceSelect } from './RequiredPlaceSelect';
import styled from 'styled-components';

const Wrapper = styled.div`
  & .rbt-input-main {
    font-weight: bold;
    border-color: #34495e;
  }

  &:hover .rbt-input-main {
    border-color: black;
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
    <Form inline>
      <Wrapper>
        <RequiredPlaceSelect
          id='countrySelect'
          selected={exploreUrl.location}
          onSelect={exploreUrl.setLocation}
        />
      </Wrapper>
    </Form>
  );
};
