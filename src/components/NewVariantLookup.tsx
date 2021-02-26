import React, { useEffect, useState } from 'react';
import { Button, Col } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import { getCurrentWeek } from '../services/api';
import { Country, parseYearWeekString, Variant } from '../services/api-types';
import { NewVariantTable } from './NewVariantTable';

interface Props {
  country: Country;
  onVariantSelect: (variant: Variant) => void;
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

export const NewVariantLookup = ({ country, onVariantSelect }: Props) => {
  const [weeks, setWeeks] = useState<string[]>([]);
  const [selectedWeek, setSelectedWeek] = useState('2021-01');

  const [table, setTable] = useState<TableQuery>();
  useEffect(() => {
    if (table && (!country || country !== table.country || selectedWeek !== table.week)) {
      setTable(undefined);
    }
  }, [table, country, selectedWeek]);

  useEffect(() => {
    let isSubscribed = true;
    getCurrentWeek().then(week => {
      if (isSubscribed) {
        const newWeeks = generateListOfWeeks(week);
        setWeeks(newWeeks);
        setSelectedWeek(newWeeks[0]);
      }
    });
    return () => {
      isSubscribed = false;
    };
  }, []);

  return (
    <>
      <Form
        onSubmit={e => {
          e.preventDefault();
          if (country && selectedWeek) {
            setTable({
              country: country,
              week: selectedWeek,
            });
          }
        }}
      >
        <Form.Row>
          <Form.Group as={Col} controlId='weekField'>
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
          <Col>
            <Button type='submit' style={{ marginTop: '30px', width: '100%' }}>
              Lookup
            </Button>
          </Col>
        </Form.Row>
      </Form>

      {table ? (
        <>
          <hr />
          <NewVariantTable
            {...parseYearWeekString(table.week)}
            country={table.country}
            onVariantSelect={onVariantSelect}
          />
        </>
      ) : null}
    </>
  );
};
