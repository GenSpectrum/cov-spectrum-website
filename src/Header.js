import React from "react";
import { Col, Container, Row, Navbar } from "react-bootstrap";


export class Header extends React.Component {


  render() {
    return (<>
      <Container fluid="md">
        <Row>
          <Col>
            <Navbar bg="light" expand="md">
              <Navbar.Brand href="/variant">Variant Monitor</Navbar.Brand>
            </Navbar>
          </Col>
        </Row>
      </Container>
    </>);
  }

}
