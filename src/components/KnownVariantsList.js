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
      selectedCountry: "Switzerland",
      selectedCountryField: ["Switzerland"],
      countryReq: null,
      variantReq: null,
    };

    this.handleVariantSelect = this.handleVariantSelect.bind(this);
    this.handleCountryChange = this.handleCountryChange.bind(this);
  }

  async componentDidMount() {
    this.fetchCountries();
    this.fetchVariants();
  }

  async fetchCountries() {
    this.state.countryReq?.cancel();
    const countryReq = BackendService.get("/resource/country");
    this.setState({ countryReq });
    const allCountries = await (await countryReq).json();

    this.setState({ allCountries });
  }

  async fetchVariants() {
    this.state.variantReq?.cancel();
    const variantReq = BackendService.get("/resource/variant");
    this.setState({ variantReq });
    const variants = await (await variantReq).json();

    this.setState({ variants });
  }

  handleVariantSelect(variant) {
    this.props.onVariantAndCountrySelect({
      variant,
      country: this.state.selectedCountry,
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
    return (
      <>
        {this.state.allCountries && (
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
        )}

        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Variant</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {this.state.variants?.map((d) => (
              <tr key={d.name}>
                <td>{d.name}</td>
                <td>
                  <Button
                    onClick={() => {
                      this.handleVariantSelect(d);
                    }}
                    variant="outline-secondary"
                    size="sm"
                  >
                    Show Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </>
    );
  }
}
