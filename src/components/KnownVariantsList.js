import React from "react";
import { Button } from "react-bootstrap";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import { Typeahead } from "react-bootstrap-typeahead";
import { BackendService } from "../services/BackendService";


export class KnownVariantsList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      allCountries: null,
      variants: null,
      selectedCountry: 'Switzerland',
      selectedCountryField: ['Switzerland']
    };

    this.handleVariantSelect = this.handleVariantSelect.bind(this);
    this.handleCountryChange = this.handleCountryChange.bind(this);
  }


  async componentDidMount() {
    this.fetchCountries();
    this.fetchVariants();
  }


  async fetchCountries() {
    const countries = await BackendService.get('/resource/country');
    this.setState({ allCountries: countries });
  }


  async fetchVariants() {
    const variants = await BackendService.get('/resource/variant');
    this.setState({ variants });
  }


  handleVariantSelect(variant) {
    this.props.onVariantAndCountrySelect({
      variant,
      country: this.state.selectedCountry
    });
  }


  handleCountryChange(selected) {
    let selectedCountry = null;
    if (selected.length === 1) {
      selectedCountry = selected[0];
    }
    this.setState({ selectedCountry, selectedCountryField: selected });
  }


  render() {
    return (<>
      {
        this.state.allCountries &&
        <Form>
          <Form.Group controlId="countryFieldGroup">
            <Form.Label>Country</Form.Label>
            <Typeahead
              id="countryField"
              selected={this.state.selectedCountryField}
              onChange={this.handleCountryChange}
              options={this.state.allCountries}
            />
          </Form.Group>
        </Form>
      }

      <Table striped bordered hover>
        <thead>
        <tr>
          <th>Variant</th>
          <th></th>
        </tr>
        </thead>
        <tbody>
        {
          this.state.variants?.map(d => (
            <tr key={d.name}>
              <td>{d.name}</td>
              <td>
                <Button
                  onClick={() => {
                    this.handleVariantSelect(d);
                  }}
                  variant="outline-secondary"
                  size="sm"
                >Show Details</Button>
              </td>
            </tr>
          ))
        }
        </tbody>
      </Table>
    </>);
  }

}
