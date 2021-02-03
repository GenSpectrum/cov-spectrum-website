import React from "react";
import { Button } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import { Typeahead } from "react-bootstrap-typeahead";
import { BackendService } from "../services/BackendService";


export class MutationLookup extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      variants: [],
      selectedCountry: 'Switzerland',
      selectedCountryField: ['Switzerland'],
      selectedMutations: '',
      // This may not be changed right now because the initial default range slider is at 50.
      selectedMatchPercentage: 50,
      countryReq: null
    };

    this.handleCountryFieldChange = this.handleCountryFieldChange.bind(this);
    this.handleMutationFieldChange = this.handleMutationFieldChange.bind(this);
    this.handleMatchPercentageFieldChange = this.handleMatchPercentageFieldChange.bind(this);
    this.handleSearchButtonClick = this.handleSearchButtonClick.bind(this);
  }


  async componentDidMount() {
    this.fetchCountries();
  }


  async fetchCountries() {
    this.state.countryReq?.cancel();
    const countryReq = BackendService.get('/resource/country');
    this.setState({ countryReq });
    const allCountries = await (await countryReq).json();

    this.setState({ allCountries });
  }


  handleCountryFieldChange(selected) {
    let selectedCountry = null;
    if (selected.length === 1) {
      selectedCountry = selected[0];
    }
    this.setState({ selectedCountry, selectedCountryField: selected });
  }


  handleMutationFieldChange(e) {
    this.setState({ selectedMutations: e.target.value });
  }


  handleMatchPercentageFieldChange(e) {
    this.setState({ selectedMatchPercentage: e.target.value });
  }


  handleSearchButtonClick() {
    const variant = {
      mutations: this.state.selectedMutations.split(',').map(m => m.trim())
    };
    this.props.onVariantAndCountrySelect({
      variant,
      country: this.state.selectedCountry
    }, this.state.selectedMatchPercentage / 100);
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
              onChange={this.handleCountryFieldChange}
              options={this.state.allCountries}
            />
          </Form.Group>
          <Form.Group controlId="mutationsFieldGroup">
            <Form.Label>
              Mutations (comma-separated and case-sensitive)
            </Form.Label>
            <Form.Control
              type="text"
              value={this.state.selectedMutations}
              placeholder="Example: S:N501Y,ORF1a:G3676-,ORF8:Q27*"
              onChange={this.handleMutationFieldChange}
            />
          </Form.Group>
          <Form.Group controlId="matchPercentageGroup">
            <Form.Label>Match Percentage</Form.Label>
            <span style={{marginLeft: '30px'}}>{ this.state.selectedMatchPercentage }%</span>
            <Form.Control
              type="range"
              onChange={this.handleMatchPercentageFieldChange}
            />
          </Form.Group>
          <Button
            variant="primary"
            onClick={this.handleSearchButtonClick}
          >
            Search
          </Button>
        </Form>
      }
    </>);
  }

}
