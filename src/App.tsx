import React from 'react';
import { ExplorePage } from './pages/ExplorePage';
import { Header } from './Header';
import Footer from './Footer';
import { Route, Switch, Redirect } from 'react-router-dom';
import { SamplePage } from './pages/SamplePage';
import { EmbedPage } from './pages/EmbedPage';
import { LoginPage } from './pages/LoginPage';
import { Col, Container, Row } from 'react-bootstrap';

function App() {
  return (
    <Switch>
      <Route path='/embed/:widget'>
        <EmbedPage />
      </Route>
      <Route path='/'>
        <MainApp />
      </Route>
    </Switch>
  );
}

function MainApp() {
  return (
    <>
      <Header />
      <Container fluid>
        <Row>
          <Col>
            <Switch>
              <Route exact path='/'>
                <Redirect to='/variant' />
              </Route>
              <Route path='/login'>
                <LoginPage />
              </Route>
              <Route path='/variant'>
                <ExplorePage />
              </Route>
              <Route path='/sample'>
                <SamplePage />
              </Route>
            </Switch>
          </Col>
          <Col></Col>
        </Row>
      </Container>
      <Footer />
    </>
  );
}

export default App;
