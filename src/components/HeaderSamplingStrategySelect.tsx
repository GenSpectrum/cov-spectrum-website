import React, { useState } from 'react';
import { Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { OverlayTriggerRenderProps } from 'react-bootstrap/esm/OverlayTrigger';
import { useRouteMatch } from 'react-router-dom';
import { unreachable } from '../helpers/unreachable';
import { SamplingStrategy } from '../services/api';

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

  const makeForm = ({ ref, ...props }: Partial<OverlayTriggerRenderProps>) => (
    <Form inline className='mr-3'>
      <Form.Label htmlFor='samplingStrategySelect' className='mr-2'>
        Sampling strategy
      </Form.Label>
      <div {...props} ref={ref}>
        <Form.Control
          as='select'
          custom
          id='samplingStrategySelect'
          value={strategy}
          onChange={ev => onStrategyChange(ev.target.value as SamplingStrategy)}
          disabled={!!locked}
          style={locked ? { pointerEvents: 'none' } : undefined}
        >
          <option value={SamplingStrategy.AllSamples}>All samples</option>
          <option value={SamplingStrategy.Surveillance}>Surveillance</option>
        </Form.Control>
      </div>
    </Form>
  );

  const tooltip = (
    <Tooltip id='samplingStrategyDisabledTooltip'>
      Filtering for surveillance samples is only supported for Switzerland.
    </Tooltip>
  );

  return locked ? (
    <OverlayTrigger placement='bottom' overlay={tooltip}>
      {makeForm}
    </OverlayTrigger>
  ) : (
    makeForm({})
  );
};
