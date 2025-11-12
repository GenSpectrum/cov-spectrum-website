import { Alert, AlertVariant } from '../helpers/ui';
import React from 'react';
import { FineGrainedFilteringBanner } from './FineGrainedFilteringBanner';

type Props = {
  messages: string[];
};

export const ErrorAlert = ({ messages }: Props) => {
  const uniqueMessages = [...new Set(messages)];
  const showFineGrainedFilteringBanner = uniqueMessages.includes(
    'Failed to fetch data from LAPIS: Unauthorized'
  );
  return (
    <>
      {showFineGrainedFilteringBanner && (
        <div className='mb-4'>
          <FineGrainedFilteringBanner />
        </div>
      )}
      <Alert variant={AlertVariant.DANGER}>
        <div key='heading' className='font-bold'>
          Error:
        </div>
        {uniqueMessages.map(e => (
          <div key={e}>{e}</div>
        ))}
      </Alert>
    </>
  );
};
