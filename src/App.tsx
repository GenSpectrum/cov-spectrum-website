import React, { useState } from 'react';
import styled from 'styled-components';
import { ExplorePage } from './pages/ExplorePage';
import { Header } from './Header';
import Footer from './Footer';
import { Route, Switch, Redirect } from 'react-router-dom';
import { SamplePage } from './pages/SamplePage';
import { LoginPage } from './pages/LoginPage';
import { Col, Container, Row } from 'react-bootstrap';
import { Country, Variant } from './services/api-types';
import { FocusPage } from './pages/FocusPage';

interface Selection {
  variant: Variant;
  matchPercentage: number;
}

export const OuterWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

export const ContentWrapper = styled.div`
  height: 80vh;
  flex-grow: 1;
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
      <Header
        countryProps={{
          selected: country,
          onSelect: setCountry,
        }}
      />
      <ContentWrapper>
        <Switch>
          <Route exact path='/'>
            <Redirect to='/variant' />
          </Route>
          <Route path='/login'>
            <ScrollableContainer>
              <LoginPage />
            </ScrollableContainer>
          </Route>
          <Route path='/variant'>
            <Container fluid style={{ height: '100%' }}>
              <Row style={{ height: '100%' }}>
                <Col as={ScrollableContainer}>
                  <ExplorePage country={country} onVariantSelect={setSelection} />
                </Col>
                <Col as={ScrollableContainer}>
                  {selection && <FocusPage {...selection} country={country} />}{' '}
                </Col>
              </Row>
            </Container>
          </Route>
          <Route path='/sample'>
            <ScrollableContainer>
              <SamplePage />
            </ScrollableContainer>
          </Route>
        </Switch>
      </ContentWrapper>
      <Footer />
    </OuterWrapper>
  );
};
