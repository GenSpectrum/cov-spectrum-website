import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { ExplorePage } from './pages/ExplorePage';
import { Header } from './Header';
import Footer from './Footer';
import { Route, Switch, Redirect } from 'react-router-dom';
import { SamplePage } from './pages/SamplePage';
import { LoginPage } from './pages/LoginPage';
import { Country, Variant } from './services/api-types';
import { FocusPage } from './pages/FocusPage';
import { scrollableContainerStyle } from './helpers/scrollable-container';

interface Selection {
  variant: Variant;
  matchPercentage: number;
}

export const OuterWrapper = styled.div`
  display: grid;
  height: 100vh;
  grid-template-columns: 50% 50%;
  grid-template-rows: 60px auto 60px;
  grid-template-areas:
    'header header'
    'left right'
    'footer footer';
`;

export const HeaderWrapper = styled.div`
  grid-area: header;
`;

export const FooterWrapper = styled.div`
  grid-area: footer;
`;

export const fullGridStyle = css`
  grid-row: 2;
  grid-column: left / right;
`;

export const FullContentWrapper = styled.div`
  ${scrollableContainerStyle}
  ${fullGridStyle}
`;

export const LoginWrapper = styled.div`
  ${scrollableContainerStyle}
  ${fullGridStyle}
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;

export const ExploreWrapper = styled.div`
  grid-area: left;
  overflow: hidden;
`;

export const FocusWrapper = styled.div`
  ${scrollableContainerStyle}
  grid-area: right;
`;

export const App = () => {
  const [selection, setSelection] = useState<Selection>();
  const [country, setCountry] = useState<Country>('Switzerland');

  return (
    <OuterWrapper>
      <HeaderWrapper>
        <Header
          countryProps={{
            selected: country,
            onSelect: setCountry,
          }}
        />
      </HeaderWrapper>

      <Switch>
        <Route exact path='/'>
          <Redirect to='/variant' />
        </Route>
        <Route path='/login'>
          <LoginWrapper>
            <LoginPage />
          </LoginWrapper>
        </Route>
        <Route path='/variant'>
          <ExploreWrapper>
            <ExplorePage country={country} onVariantSelect={setSelection} />
          </ExploreWrapper>
          <FocusWrapper>{selection && <FocusPage {...selection} country={country} />}</FocusWrapper>
        </Route>
        <Route path='/sample'>
          <FullContentWrapper>
            <SamplePage />
          </FullContentWrapper>
        </Route>
      </Switch>

      <FooterWrapper>
        <Footer />
      </FooterWrapper>
    </OuterWrapper>
  );
};
