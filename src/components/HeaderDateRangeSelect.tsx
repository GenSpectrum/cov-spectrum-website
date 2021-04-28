import React from 'react';
import { Form } from 'react-bootstrap';
import { useExploreUrl } from '../helpers/explore-url';
import { DateRange } from '../services/api';

export const HeaderDateRangeSelect = () => {
  const exploreUrl = useExploreUrl();

  if (!exploreUrl) {
    return null;
  }

  return (
    <Form inline className='mr-3'>
      <Form.Control
        as='select'
        custom
        id='dateRangeSelect'
        value={exploreUrl.dateRange}
        onChange={ev => exploreUrl.setDateRange(ev.target.value as DateRange)}
      >
        <option value='AllTimes'>All time</option>
        <option value='Past3M'>Past 3 months</option>
        <option value='Past6M'>Past 6 months</option>
        <option value='Y2020'>2020</option>
        <option value='Y2021'>2021</option>
      </Form.Control>
    </Form>
  );
};
