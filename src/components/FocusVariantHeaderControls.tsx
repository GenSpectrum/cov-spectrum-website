import React from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { AccountService } from '../services/AccountService';
import { DateRange, SamplingStrategy, toLiteralSamplingStrategy } from '../services/api';
import { Country, Variant } from '../services/api-types';
import { NextcladeService } from '../services/NextcladeService';
import { LazySampleButton } from './LazySampleButton';

export interface Props {
  country: Country;
  matchPercentage: number;
  variant: Variant;
  samplingStrategy: SamplingStrategy;
  dateRange: DateRange;
}

export const FocusVariantHeaderControls = ({
  country,
  matchPercentage,
  variant,
  samplingStrategy,
  dateRange,
}: Props) => {
  const nextcladeButton = (
    <Button
      onClick={() =>
        NextcladeService.showVariantOnNextclade({
          variant,
          matchPercentage,
          country,
          samplingStrategy: toLiteralSamplingStrategy(samplingStrategy),
        })
      }
      variant='secondary'
      size='sm'
      className='mr-2'
    >
      Show on Nextclade
    </Button>
  );

  return (
    <>
      {AccountService.isLoggedIn() && nextcladeButton}
      {!AccountService.isLoggedIn() && country === 'Switzerland' && (
        <OverlayTrigger
          placement='bottom'
          overlay={
            <Tooltip id='tooltip-show-on-nextclade'>
              Note: We can only use our own sequences for the Nextclade analysis.
            </Tooltip>
          }
        >
          {nextcladeButton}
        </OverlayTrigger>
      )}
      {AccountService.isLoggedIn() && (
        <LazySampleButton
          query={{ variantSelector: { variant, matchPercentage }, country, samplingStrategy, dateRange }}
          variant='secondary'
          size='sm'
        >
          Show samples
        </LazySampleButton>
      )}
    </>
  );
};
