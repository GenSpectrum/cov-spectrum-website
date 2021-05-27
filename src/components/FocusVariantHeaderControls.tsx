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
import { useState } from 'react';

export interface Props {
  country: Country;
  matchPercentage: number;
  variant: Variant;
  samplingStrategy: SamplingStrategy;
  dateRange: DateRange;
}

const integrations: Integration[] = [
  new WikipediaIntegration(),
  new PangoLineageIntegration(),
  new NextcladeIntegration(),
  new NextstrainIntegration(),
  new CoVariantsIntegration(),
  new OutbreakInfoIntegration(),
];

export const FocusVariantHeaderControls = React.memo(
  ({ country, matchPercentage, variant, samplingStrategy, dateRange }: Props): JSX.Element => {
    const integrationSelector = {
      variant,
      matchPercentage,
      country,
      samplingStrategy: toLiteralSamplingStrategy(samplingStrategy),
    };
    const [show, setShow] = useState(false);
    const showDropdown = (_: any) => {
      setShow(!show);
    };
    const hideDropdown = (_: any) => {
      setShow(false);
    };

    const integrationButtons = (
      <>
        <DropdownButton
          as={ButtonGroup}
          title='Show on other websites'
          variant='secondary'
          size='sm'
          className='mr-2 mt-3'
          onMouseEnter={showDropdown}
          onMouseLeave={hideDropdown}
          show={show}
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
            className="mt-3 mr-3"
          >
            Show samples
          </LazySampleButton>
        )}
      </>
    );
  }
);
