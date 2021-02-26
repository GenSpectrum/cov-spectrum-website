import React, { useState } from 'react';
import styled from 'styled-components';
import { ExplorePage } from './pages/ExplorePage';
import { Header } from './Header';
import Footer from './Footer';
import { Route, Switch, Redirect } from 'react-router-dom';
import { SamplePage } from './pages/SamplePage';
import { LoginPage } from './pages/LoginPage';
import { Country, Variant } from './services/api-types';
import { FocusPage } from './pages/FocusPage';

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

export const GridHeader = styled.div`
  grid-area: header;
`;

export const GridLeft = styled.div`
  grid-area: left;
  overflow: hidden;
`;

export const GridRight = styled.div`
  grid-area: right;
  overflow: hidden;
`;

export const GridFull = styled.div`
  grid-row: 2;
  grid-column: left / right;
  overflow: hidden;
`;

export const GridFooter = styled.div`
  grid-area: footer;
`;

export const ScrollableContainer = styled.div`
  height: 100%;
  box-sizing: border-box;
  padding-top: 20px;
  overflow-x: hidden;
  overflow-y: scroll;
`;

export const App = () => {
  const [selection, setSelection] = useState<Selection>();
  const [country, setCountry] = useState<Country>('Switzerland');

  return (
    <OuterWrapper>
      <GridHeader>
        <Header
          countryProps={{
            selected: country,
            onSelect: setCountry,
          }}
        />
      </GridHeader>

      <Switch>
        <Route exact path='/'>
          <Redirect to='/variant' />
        </Route>
        <Route path='/login'>
          <GridFull>
            <ScrollableContainer>
              <LoginPage />
            </ScrollableContainer>
          </GridFull>
        </Route>
        <Route path='/variant'>
          <GridLeft>
            <ExplorePage country={country} onVariantSelect={setSelection} />
          </GridLeft>
          <GridRight>
            <ScrollableContainer>
              {selection && <FocusPage {...selection} country={country} />}
            </ScrollableContainer>
          </GridRight>
        </Route>
        <Route path='/sample'>
          <GridFull>
            <ScrollableContainer>
              <SamplePage />
            </ScrollableContainer>
          </GridFull>
        </Route>
      </Switch>

      <GridFooter>
        <Footer />
      </GridFooter>
    </OuterWrapper>
  );
};
