import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { ButtonGroup, DropdownButton } from 'react-bootstrap';
import { Integration } from '../services/external-integrations/Integration';
import { PangoLineageIntegration } from '../services/external-integrations/PangoLineageIntegration';
import { OutbreakInfoIntegration } from '../services/external-integrations/OutbreakInfoIntegration';
import { WikipediaIntegration } from '../services/external-integrations/WikipediaIntegration';
import { CoVariantsIntegration } from '../services/external-integrations/CoVariantsIntegration';
import { useState } from 'react';
import { LocationDateVariantSelector } from '../data/LocationDateVariantSelector';

export interface Props {
  selector: LocationDateVariantSelector;
}

const integrations: Integration[] = [
  new WikipediaIntegration(),
  new PangoLineageIntegration(),
  new CoVariantsIntegration(),
  new OutbreakInfoIntegration(),
];

export const FocusVariantHeaderControls = React.memo(
  ({ selector }: Props): JSX.Element => {
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
          className='mr-2 mt-3 '
          onMouseEnter={showDropdown}
          onMouseLeave={hideDropdown}
          show={show}
        >
          {integrations.map(
            integration =>
              integration.isAvailable(selector) && (
                <Dropdown.Item key={integration.name} onClick={() => integration.open(selector)}>
                  {integration.name}
                </Dropdown.Item>
              )
          )}
        </DropdownButton>
      </>
    );

    return <>{integrationButtons}</>;
  }
);
