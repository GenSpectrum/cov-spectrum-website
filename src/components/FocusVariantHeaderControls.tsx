import React from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import { ButtonGroup, DropdownButton } from 'react-bootstrap';
import { Integration } from '../services/external-integrations/Integration';
import { PangoLineageIntegration } from '../services/external-integrations/PangoLineageIntegration';
import { OutbreakInfoIntegration } from '../services/external-integrations/OutbreakInfoIntegration';
import { WikipediaIntegration } from '../services/external-integrations/WikipediaIntegration';
import { CoVariantsIntegration } from '../services/external-integrations/CoVariantsIntegration';
import { useState } from 'react';
import { LocationDateVariantSelector } from '../data/LocationDateVariantSelector';
import { FaDownload } from 'react-icons/fa';
import { UsherIntegration } from '../services/external-integrations/UsherIntegration';
import { sequenceDataSource } from '../helpers/sequence-data-source';
import { TaxoniumIntegration } from '../services/external-integrations/TaxoniumIntegration';
import { getCsvLinkToContributors, getCsvLinkToDetails } from '../data/api-lapis';

export interface Props {
  selector: LocationDateVariantSelector;
}

const integrations: Integration[] = [
  new WikipediaIntegration(),
  new PangoLineageIntegration(),
  new CoVariantsIntegration(),
  new OutbreakInfoIntegration(),
  new UsherIntegration(),
  new TaxoniumIntegration(),
];

export const FocusVariantHeaderControls = React.memo(({ selector }: Props): JSX.Element => {
  const [showDropdown, setShowDropdown] = useState(false);
  const showDropdownFunc = (_: any) => {
    setShowDropdown(!showDropdown);
  };
  const hideDropdownFunc = (_: any) => {
    setShowDropdown(false);
  };

  const downloadSequenceList = async () => {
    let link;
    // If the open version is used, all the metadata will be downloaded. If GISAID is used, only the contributors
    // will be downloaded.
    if (sequenceDataSource === 'open') {
      link = await getCsvLinkToDetails(selector);
    } else {
      link = await getCsvLinkToContributors(selector);
    }
    window.open(link, '_blank');
  };

  return (
    <>
      <Button className='mr-2 mt-3' size='sm' variant='secondary' onClick={downloadSequenceList}>
        Sequence list <FaDownload className='inline-block ml-1' />
      </Button>
      <DropdownButton
        as={ButtonGroup}
        title='Other websites'
        variant='secondary'
        size='sm'
        className='mr-2 mt-3'
        onMouseEnter={showDropdownFunc}
        onMouseLeave={hideDropdownFunc}
        show={showDropdown}
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
});
