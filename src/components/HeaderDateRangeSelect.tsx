import React from 'react';
import { Form } from 'react-bootstrap';
import { ExploreUrl } from '../helpers/explore-url';
import { DateRange } from '../services/api-types';

interface Props {
  exploreUrl?: ExploreUrl;
}

export const HeaderDateRangeSelect = ({ exploreUrl }: Props) => {
  if (!exploreUrl) {
    return null;
  }

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    exploreUrl.setDateRange(event.target.value as DateRange);
  };

  return (
    <Form inline className='mr-3'>
      <Form.Control
        as='select'
        custom
        id='dateRangeSelect'
        value={exploreUrl.dateRange}
        onChange={handleChange}
      >
        <option value='AllTimes'>All times</option>
        <option value='Past3M'>Past 3 months</option>
        <option value='Past6M'>Past 6 months</option>
        <option value='Y2020'>2020</option>
        <option value='Y2021'>2021</option>
      </Form.Control>
    </Form>
  );
};
