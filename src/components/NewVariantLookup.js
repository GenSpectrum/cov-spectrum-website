import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import { Typeahead } from 'react-bootstrap-typeahead';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { NewVariantTable } from './NewVariantTable';
import { getCountries, getCurrentWeek } from '../services/api';

// export class NewVariantLookup extends React.Component {

export const NewVariantLookup = ({ onVariantAndCountrySelect }) => {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('Switzerland');

  const [weeks, setWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState('2021-1');

  const [table, setTable] = useState({ country: 'Switzerland', week: 0 });
  const [variantDashboard, setVariantDashboard] = useState({ country: null, week: null });

  const handleVariantSelect = variant => {
    console.log('new country is ', table.country);
    onVariantAndCountrySelect({
      variant,
      country: table.country,
    });
  };

  const convertToWeeks = currentIsoWeek => {
    const weeks = [];
    for (let i = 40; i <= 53; i++) {
      weeks.unshift('2020-' + i);
    }
    for (let i = 1; i <= currentIsoWeek; i++) {
      weeks.unshift('2021-' + i);
    }
    return weeks;
  };

  useEffect(() => {
    let isSubscribed = true;
    // const controller = new AbortController();
    // const signal = controller.signal;
    getCurrentWeek().then(week => {
      if (isSubscribed) {
        const newWeeks = convertToWeeks(week);
        console.log('new weeks is ', weeks, 'for', week);
        setWeeks(newWeeks);
        setSelectedWeek(newWeeks[0]);
      }
    });
    getCountries().then(countries => {
      if (isSubscribed) {
        setCountries(countries);
      }
    });
    return () => {
      isSubscribed = false;
      // controller.abort();
      console.log('TIME Cleanup render for variant age distribution plot');
    };
  }, []);

  return (
    <Container fluid='md'>
      <Row>
        <Col>
          {
            <Form>
              <Form.Group controlId='countryFieldGroup'>
                <Form.Label>Country</Form.Label>
                <Typeahead
                  id='countryField'
                  onChange={selected => {
                    let selectedCountry = null;
                    if (selected.length === 1) {
                      selectedCountry = selected[0];
                    }
                    console.log('Selected Country is', selected[0]);
                    setSelectedCountry(selectedCountry);
                  }}
                  options={countries}
                />
              </Form.Group>
            </Form>
          }
        </Col>
        <Col>
          <Form>
            <Form.Group controlId='countryFieldGroup'>
              <Form.Label>Week</Form.Label>
              <Form.Control
                value={selectedWeek}
                as='select'
                onChange={e => {
                  setSelectedWeek(e.target.value);
                }}
              >
                {weeks.map(week => (
                  <option key={week}>{week}</option>
                ))}
              </Form.Control>
            </Form.Group>
          </Form>
        </Col>
        <Col>
          <Button
            onClick={e => {
              if (selectedCountry && selectedWeek) {
                setTable({
                  country: selectedCountry,
                  week: selectedWeek,
                });
              }
            }}
            style={{ marginTop: '30px', width: '100%' }}
          >
            Lookup
          </Button>
        </Col>
      </Row>

      {table.country && table.week ? (
        <>
          <hr />
          <NewVariantTable
            country={table.country}
            yearWeek={table.week}
            onVariantSelect={handleVariantSelect}
          />
        </>
      ) : null}
    </Container>
  );
  // }
};
