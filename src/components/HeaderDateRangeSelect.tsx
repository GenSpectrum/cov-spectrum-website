import React, { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { ExploreUrl } from '../helpers/explore-url';
import { dateRangeUrlToSelector, isDateRangeEncoded } from '../data/DateRangeUrlEncoded';
import {
  DateRangeSelector,
  SpecialDateRange,
  SpecialDateRangeSelector,
  specialDateRangeToString,
} from '../data/DateRangeSelector';

interface Props {
  exploreUrl?: ExploreUrl;
  setDateRangeSelector?: React.Dispatch<React.SetStateAction<DateRangeSelector>>;
  setSubmissionDateRangeSelector?: React.Dispatch<React.SetStateAction<DateRangeSelector>>;
  setSpecialSubmissionDateRaw?: React.Dispatch<React.SetStateAction<string | null>>;
  specialSubmissionDateRaw?: string | null;
}

export const HeaderDateRangeSelect = ({
  exploreUrl,
  setDateRangeSelector,
  setSubmissionDateRangeSelector,
  setSpecialSubmissionDateRaw,
  specialSubmissionDateRaw,
}: Props) => {
  const [dateRangeValue, setDateRangeValue] = useState<string>(
    specialSubmissionDateRaw ? specialSubmissionDateRaw : 'Past6M'
  );

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    if (isDateRangeEncoded(event.target.value)) {
      if (setSubmissionDateRangeSelector) {
        setDateRangeValue(event.target.value);
        setSubmissionDateRangeSelector(dateRangeUrlToSelector(event.target.value));
        if (setSpecialSubmissionDateRaw) {
          setSpecialSubmissionDateRaw(event.target.value);
        }
        return;
      }

      if (exploreUrl) {
        exploreUrl.setDateRange(dateRangeUrlToSelector(event.target.value));
      }

      if (setDateRangeSelector) {
        setDateRangeValue(event.target.value);
        setDateRangeSelector(dateRangeUrlToSelector(event.target.value));
      }
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

  useEffect(() => {
    if (specialSubmissionDateRaw) {
      setDateRangeValue(specialSubmissionDateRaw);
    }
  }, [specialSubmissionDateRaw]);

  return (
    <Form>
      <Form.Control
        as='select'
        id='dateRangeSelect'
        value={setSubmissionDateRangeSelector ? dateRangeValue : exploreUrl ? value : dateRangeValue}
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
  );
};
