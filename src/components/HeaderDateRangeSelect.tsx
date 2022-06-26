import React from 'react';
import { Form } from 'react-bootstrap';
import { ExploreUrl } from '../helpers/explore-url';
import { dateRangeUrlToSelector, isDateRangeEncoded } from '../data/DateRangeUrlEncoded';
import {
  SpecialDateRange,
  SpecialDateRangeSelector,
  specialDateRangeToString,
} from '../data/DateRangeSelector';

interface Props {
  exploreUrl?: ExploreUrl;
}

export const HeaderDateRangeSelect = ({ exploreUrl }: Props) => {
  if (!exploreUrl) {
    return null;
  }

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    if (isDateRangeEncoded(event.target.value)) {
      exploreUrl.setDateRange(dateRangeUrlToSelector(event.target.value));
    }
  };

  let value = '';
  if (exploreUrl.dateRange instanceof SpecialDateRangeSelector) {
    value = exploreUrl.dateRange.mode;
  }
  const specialDateRanges: SpecialDateRange[] = [
    'AllTimes',
    'Y2020',
    'Y2021',
    'Y2022',
    'Past2W',
    'Past1M',
    'Past2M',
    'Past3M',
    'Past6M',
  ];
  return (
    <Form inline>
      <Form.Control
        as='select'
        custom
        id='dateRangeSelect'
        value={value}
        onChange={handleChange}
        className='rounded-l rounded-r-none mt-1'
        style={{ height: '55px', marginRight: '5px' }}
      >
        <option value='' disabled>
          Custom Range
        </option>
        {specialDateRanges.map(d => (
          <option value={d} key={specialDateRangeToString(d)}>
            {specialDateRangeToString(d)}
          </option>
        ))}
      </Form.Control>
    </Form>
  );
};
