import React from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { AccountService } from '../services/AccountService';
import { SamplingStrategy, toLiteralSamplingStrategy } from '../services/api';
import { Country, Variant } from '../services/api-types';
import { NextcladeService } from '../services/NextcladeService';
import { LazySampleButton } from './LazySampleButton';

export interface Props {
  country: Country;
  matchPercentage: number;
  variant: Variant;
  samplingStrategy: SamplingStrategy;
}

export const FocusVariantHeaderControls = ({
  country,
  matchPercentage,
  variant,
  samplingStrategy,
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
      variant='outline-dark'
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
              Due to licensing reasons, we can currently only provide sequences submitted by the D-BSSE, ETHZ
              for an analysis on Nextclade. If you are a submitter to GISAID and are happy to give us the
              right to show your sequences here, please contact us!
            </Tooltip>
          }
        >
          {nextcladeButton}
        </OverlayTrigger>
      )}
      <LazySampleButton
        query={{ variantSelector: { variant, matchPercentage }, country, samplingStrategy }}
        variant='outline-dark'
        size='sm'
      >
        Show samples
      </LazySampleButton>
    </>
  );
};
