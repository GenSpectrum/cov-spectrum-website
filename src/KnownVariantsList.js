import React from "react";
import { Button } from "react-bootstrap";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import { Typeahead } from "react-bootstrap-typeahead";
import { BackendService } from "./BackendService";


export class KnownVariantsList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      variants: [
        {
          name: 'B.1.1.7',
          mutations: [
            'S:Y144-', 'S:N501Y', 'S:A570D', 'S:P681H', 'S:T716I', 'S:S982A', 'S:D1118H', 'ORF8:R52I', 'ORF8:Y73C',
            'N:D3L', 'N:S235F', 'ORF1a:T1001I', 'ORF1a:S3675-', 'ORF1a:G3676-', 'ORF1a:A1708D', 'ORF1a:I2230T',
            'ORF1a:F3677-', 'ORF8:Q27*', 'S:V70-', 'S:H69-'
          ]
        },
        {
          name: 'S.501Y.V2',
          mutations: [
            'ORF1a:T265I', 'ORF1a:K1655N', 'ORF1a:K3353R', 'S:D80A', 'S:K417N', 'S:E484K', 'S:N501Y', 'S:A701V',
            'ORF3a:Q57H', 'ORF3a:S171L', 'E:P71L', 'N:T205I'
          ]
        }
      ],
      selectedCountry: 'Switzerland',
      selectedCountryField: ['Switzerland']
    };

    this.handleVariantSelect = this.handleVariantSelect.bind(this);
    this.handleCountryChange = this.handleCountryChange.bind(this);
  }


  async componentDidMount() {
    this.fetchCountries();
  }


  async fetchCountries() {
    const countries = await BackendService.get('/country');
    this.setState({ allCountries: countries });
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
          this.state.variants.map(d => (
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
