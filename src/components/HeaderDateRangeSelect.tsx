import React, { useState } from 'react';
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
  setDateRangeSelector?: any;
}

export const HeaderDateRangeSelect = ({ exploreUrl, setDateRangeSelector }: Props) => {
  const [dateRangeValue, setDateRangeValue] = useState<string>('Past6M');

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    if (isDateRangeEncoded(event.target.value) && exploreUrl) {
      exploreUrl.setDateRange(dateRangeUrlToSelector(event.target.value));
    }
    if (setDateRangeSelector && isDateRangeEncoded(event.target.value)) {
      setDateRangeValue(event.target.value);
      setDateRangeSelector(dateRangeUrlToSelector(event.target.value));
    }
  };

  let value = '';
  if (exploreUrl && exploreUrl.dateRange instanceof SpecialDateRangeSelector) {
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
    <div>
      <Form>
        <Form.Control
          as='select'
          id='dateRangeSelect'
          value={exploreUrl ? value : dateRangeValue}
          onChange={handleChange}
          className='rounded mt-1'
          style={{ height: '55px', marginRight: '5px' }}
        >
          {specialDateRanges.map(d => (
            <option value={d} key={specialDateRangeToString(d)}>
              {specialDateRangeToString(d)}
            </option>
          ))}
        </Form.Control>
      </Form>
    </div>
  );
};
