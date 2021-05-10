import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { ButtonGroup, DropdownButton } from 'react-bootstrap';
import { AccountService } from '../services/AccountService';
import { DateRange, SamplingStrategy, toLiteralSamplingStrategy } from '../services/api';
import { Country, Variant } from '../services/api-types';
import { NextcladeIntegration } from '../services/external-integrations/NextcladeIntegration';
import { LazySampleButton } from './LazySampleButton';
import { Integration } from '../services/external-integrations/Integration';
import { PangoLineageIntegration } from '../services/external-integrations/PangoLineageIntegration';
import { OutbreakInfoIntegration } from '../services/external-integrations/OutbreakInfoIntegration';
import { NextstrainIntegration } from '../services/external-integrations/NextstrainIntegration';
import { WikipediaIntegration } from '../services/external-integrations/WikipediaIntegration';
import { CoVariantsIntegration } from '../services/external-integrations/CoVariantsIntegration';

export interface Props {
  country: Country;
  matchPercentage: number;
  variant: Variant;
  samplingStrategy: SamplingStrategy;
  dateRange: DateRange;
}

const integrations: Integration[] = [
  new NextcladeIntegration(),
  new WikipediaIntegration(),
  new PangoLineageIntegration(),
  new CoVariantsIntegration(),
  new OutbreakInfoIntegration(),
  new NextstrainIntegration(),
];

export const FocusVariantHeaderControls = ({
  country,
  matchPercentage,
  variant,
  samplingStrategy,
  dateRange,
}: Props) => {
  const integrationSelector = {
    variant,
    matchPercentage,
    country,
    samplingStrategy: toLiteralSamplingStrategy(samplingStrategy),
  };

  const integrationButtons = (
    <>
      <DropdownButton
        as={ButtonGroup}
        title='Show on other websites'
        variant='secondary'
        size='sm'
        className='mr-2'
      >
        {integrations.map(
          integration =>
            integration.isAvailable(integrationSelector) && (
              <Dropdown.Item key={integration.name} onClick={() => integration.open(integrationSelector)}>
                {integration.name}
              </Dropdown.Item>
            )
        )}
      </DropdownButton>
    </>
  );

  return (
    <>
      {integrationButtons}
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
