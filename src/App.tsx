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

interface Selection {
  variant: Variant;
  matchPercentage: number;
}

export const App = () => {
  const [selection, setSelection] = useState<Selection>();
  const [country, setCountry] = useState<Country>('Switzerland');

  return (
    <>
      <Header />
      <Switch>
        <Route exact path='/'>
          <Redirect to='/variant' />
        </Route>
        <Route path='/login'>
          <LoginPage />
        </Route>
        <Route path='/variant'>
          <Container fluid>
            <Row>
              <Col>
                <ExplorePage onSelectVariant={setSelection} />
              </Col>
              <Col>{selection && <FocusPage {...selection} country={country} />} </Col>
            </Row>
          </Container>
        </Route>
        <Route path='/sample'>
          <SamplePage />
        </Route>
      </Switch>
      <Footer />
    </>
  );
};
