import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import { useRouteMatch } from 'react-router-dom';
import { AccountService } from '../services/AccountService';
import { SamplingStrategy } from '../services/api';

enum LockReason {
  PrivateLoginRequired = 'PrivateLoginRequired',
  NotSupportedByScreen = 'NotSupportedByScreen',
}

export interface Props {
  strategy: SamplingStrategy;
  locked?: LockReason;
  onStrategyChange: (strategy: SamplingStrategy) => void;
}

const supportedUrls = ['/explore', '/global-samples'];

export function useSamplingStrategy(): Props {
  const isSupported = !!useRouteMatch(supportedUrls);
  const isLoggedIn = AccountService.isLoggedIn();

  const locked =
    (!isSupported && LockReason.NotSupportedByScreen) ||
    (!isLoggedIn && LockReason.PrivateLoginRequired) ||
    undefined;

  const [preferredStrategy, setPreferredStrategy] = useState(SamplingStrategy.AllSamples);

  return {
    strategy: locked ? SamplingStrategy.AllSamples : preferredStrategy,
    locked,
    onStrategyChange: setPreferredStrategy,
  };
}

export const HeaderSamplingStrategySelect = ({ strategy, onStrategyChange, locked }: Props) => {
  if (locked === LockReason.NotSupportedByScreen) {
    return null;
  }

  return (
    <Form inline className='mr-3'>
      <Form.Label htmlFor='samplingStrategySelect' className='mr-2'>
        Sampling strategy
      </Form.Label>
      <Form.Control as='select' custom id='samplingStrategySelect' value={strategy} disabled={!!locked}>
        <option value={SamplingStrategy.AllSamples}>All samples</option>
        <option value={SamplingStrategy.Surveillance}>Surveillance</option>
      </Form.Control>
    </Form>
  );
};
