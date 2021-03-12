import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import { useRouteMatch } from 'react-router-dom';
import { SamplingStrategy } from '../services/api';
import { unreachable } from '../helpers/unreachable';

enum LockReason {
  ScreenNotSupported = 'ScreenNotSupported',
  CountryNotSupported = 'CountryNotSupported',
}

export interface Props {
  strategy: SamplingStrategy;
  locked?: LockReason;
  onStrategyChange: (strategy: SamplingStrategy) => void;
}

export function useSamplingStrategy(): Props {
  const match = useRouteMatch<{ country: string }>('/explore/:country');

  const screenIsSupported = !!match;
  const countryIsSupported = match?.params.country === 'Switzerland';

  const locked =
    (!screenIsSupported && LockReason.ScreenNotSupported) ||
    (!countryIsSupported && LockReason.CountryNotSupported) ||
    undefined;

  const [preferredStrategy, setPreferredStrategy] = useState(SamplingStrategy.AllSamples);

  return {
    strategy: locked ? SamplingStrategy.AllSamples : preferredStrategy,
    locked,
    onStrategyChange: setPreferredStrategy,
  };
}

export const HeaderSamplingStrategySelect = ({ strategy, onStrategyChange, locked }: Props) => {
  if (locked === LockReason.ScreenNotSupported) {
    return null;
  } else if (locked && locked !== LockReason.CountryNotSupported) {
    return unreachable(locked);
  }

  return (
    <Form inline className='mr-3'>
      <Form.Label htmlFor='samplingStrategySelect' className='mr-2'>
        Sampling strategy
      </Form.Label>
      <Form.Control
        as='select'
        custom
        id='samplingStrategySelect'
        value={strategy}
        onChange={ev => onStrategyChange(ev.target.value as SamplingStrategy)}
        disabled={!!locked}
      >
        <option value={SamplingStrategy.AllSamples}>All samples</option>
        <option value={SamplingStrategy.Surveillance}>Surveillance</option>
      </Form.Control>
    </Form>
  );
};
