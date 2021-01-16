import React from 'react';
import Form from "react-bootstrap/Form";
import { Typeahead } from 'react-bootstrap-typeahead';
import { BackendService } from "./BackendService";
import { Button, Col, Container, Row } from "react-bootstrap";
import { NewVariantTable } from "./NewVariantTable";


export class NewVariantPage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      allCountries: [],
      weeks: [],
      table: {
        country: null,
        week: null
      },
      variantDashboard: {
        variant: null,
        country: null
      }
    };

    this.handleVariantSelect = this.handleVariantSelect.bind(this);
  }


  async componentDidMount() {
    this.fetchCountries();
    this.setWeeks();
  }


  async fetchCountries() {
    const countries = await BackendService.get('/country');
    this.setState({ allCountries: countries });
  }


  async setWeeks() {
    // TODO Improve the whole function
    const currentIsoWeek = await BackendService.get('/utils/current-week');

    const weeks = []
    for (let i = 40; i <= 53; i++) {
      weeks.unshift('2020-' + i);
    }
    for (let i = 1; i <= currentIsoWeek; i++) {
      weeks.unshift('2021-' + i);
    }
    this.setState({ weeks, selectedWeek: weeks[0] })
  }


  handleVariantSelect(variant) {
    this.props.onVariantAndCountrySelect({
      variant,
      country: this.state.table.country
    })
  }


  render() {
    return (
      <Container fluid="md">
        <Row>
          <Col>
            {
              (
                <Form>
                  <Form.Group controlId="countryFieldGroup">
                    <Form.Label>Country</Form.Label>
                    <Typeahead
                      id="countryField"
                      onChange={(selected) => {
                        let selectedCountry = null;
                        if (selected.length === 1) {
                          selectedCountry = selected[0];
                        }
                        this.setState({ selectedCountry });
                      }}
                      options={this.state.allCountries}
                    />
                  </Form.Group>
                </Form>
              )
            }
          </Col>
          <Col>
            <Form>
              <Form.Group controlId="countryFieldGroup">
                <Form.Label>Week</Form.Label>
                <Form.Control value={this.state.selectedWeek} as="select" onChange={(e) => {
                  this.setState({ selectedWeek: e.target.value });
                }}>
                  {
                    this.state.weeks.map(week => <option key={week}>{week}</option>)
                  }
                </Form.Control>
              </Form.Group>
            </Form>
          </Col>
          <Col>
            <Button onClick={(e) => {
              if (this.state.selectedCountry && this.state.selectedWeek) {
                this.setState({
                  table: {
                    country: this.state.selectedCountry,
                    week: this.state.selectedWeek
                  }
                })
              }
            }} style={{ marginTop: '30px', width: '100%' }}>Lookup</Button>
          </Col>
        </Row>

        {
          this.state.table.country && this.state.table.week ?
            <>
              <hr />
              <NewVariantTable
                country={this.state.table.country}
                yearWeek={this.state.table.week}
                onVariantSelect={this.handleVariantSelect}
              />
            </>:
            null
        }



      </Container>
    );
  }
}
