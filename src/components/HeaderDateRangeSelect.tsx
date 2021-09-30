import React from 'react';
import { Form } from 'react-bootstrap';
import { ExploreUrl } from '../helpers/explore-url';
import {
  ALL_TIMES,
  DateRange,
  PAST_3M,
  PAST_6M,
  specificDateRangeRegEx,
  Y2020,
  Y2021,
} from '../services/api-types';
import { dateRangeToString } from '../services/api';

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
    <Form inline>
      <Form.Control
        as='select'
        custom
        id='dateRangeSelect'
        defaultValue={''}
        value={specificDateRangeRegEx.test(exploreUrl.dateRange) ? '' : exploreUrl.dateRange}
        onChange={handleChange}
      >
        <option value='' disabled>
          Custom Ranges
        </option>
        <option value={ALL_TIMES}>{dateRangeToString(ALL_TIMES)}</option>
        <option value={PAST_3M}>{dateRangeToString(PAST_3M)}</option>
        <option value={PAST_6M}>{dateRangeToString(PAST_6M)}</option>
        <option value={Y2020}>{dateRangeToString(Y2020)}</option>
        <option value={Y2021}>{dateRangeToString(Y2021)}</option>
      </Form.Control>
    </Form>
  );
};
