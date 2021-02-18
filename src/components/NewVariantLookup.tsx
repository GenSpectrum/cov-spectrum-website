import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { NewVariantTable } from './NewVariantTable';
import { getCurrentWeek } from '../services/api';
import { Country, parseYearWeekString, Variant } from '../services/api-types';
import { CountryFormGroup } from './CountryFormGroup';

export interface SelectedVariantAndCountry {
  variant: Variant;
  country?: Country;
}

interface Props {
  onVariantAndCountrySelect: (selected: SelectedVariantAndCountry) => void;
}

interface TableQuery {
  country: Country;
  week: string;
}

const generateListOfWeeks = (currentIsoWeek: number) => {
  const weeks = [];
  for (let i = 40; i <= 53; i++) {
    weeks.unshift('2020-' + i);
  }
  for (let i = 1; i <= currentIsoWeek; i++) {
    weeks.unshift('2021-' + i);
  }
  return weeks;
};

export const NewVariantLookup = ({ onVariantAndCountrySelect }: Props) => {
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>('Switzerland');

  const [weeks, setWeeks] = useState<string[]>([]);
  const [selectedWeek, setSelectedWeek] = useState('2021-01');

  const [table, setTable] = useState<TableQuery>();
  useEffect(() => {
    if (table && (!selectedCountry || selectedCountry !== table.country || selectedWeek !== table.week)) {
      setTable(undefined);
    }
  }, [table, selectedCountry, selectedWeek]);

  useEffect(() => {
    let isSubscribed = true;
    // const controller = new AbortController();
    // const signal = controller.signal;
    getCurrentWeek().then(week => {
      if (isSubscribed) {
        const newWeeks = generateListOfWeeks(week);
        console.log('new weeks is ', newWeeks, 'for', week);
        setWeeks(newWeeks);
        setSelectedWeek(newWeeks[0]);
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
          <Form>
            <CountryFormGroup onSelect={setSelectedCountry} />
          </Form>
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

      {table ? (
        <>
          <hr />
          <NewVariantTable
            {...parseYearWeekString(table.week)}
            country={table.country}
            onVariantSelect={variant => onVariantAndCountrySelect({ variant, country: table?.country })}
          />
        </>
      ) : null}
    </Container>
  );
  // }
};
