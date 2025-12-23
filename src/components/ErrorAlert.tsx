import { Alert, AlertVariant } from '../helpers/ui';
import React from 'react';

type Props = {
  messages: string[];
};

export const ErrorAlert = ({ messages }: Props) => {
  const uniqueMessages = [...new Set(messages)];
  return (
    <Alert variant={AlertVariant.DANGER}>
      <div key='heading' className='font-bold'>
        Error:
      </div>
      {uniqueMessages.map(e => (
        <div key={e}>{e}</div>
      ))}
    </Alert>
  );
};
