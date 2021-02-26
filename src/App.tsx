import React, { useState } from 'react';
import { ExplorePage } from './pages/ExplorePage';
import { Header } from './Header';
import Footer from './Footer';
import { Route, Switch, Redirect } from 'react-router-dom';
import { SamplePage } from './pages/SamplePage';
import { LoginPage } from './pages/LoginPage';
import { Col, Container, Row } from 'react-bootstrap';
import { Country, Variant } from './services/api-types';
import { FocusPage } from './pages/FocusPage';
import { ScrollableContainer } from './components/ScrollableContainer';

interface Selection {
  variant: Variant;
  matchPercentage: number;
}

export const App = () => {
  const [selection, setSelection] = useState<Selection>();
  const [country, setCountry] = useState<Country>('Switzerland');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header
        countryProps={{
          selected: country,
          onSelect: setCountry,
        }}
      />
      <div style={{ height: '80vh', flexGrow: 1 }}>
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
      </div>
      <Footer />
    </div>
  );
};
