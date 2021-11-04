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
import { ContributorsDataset } from '../data/ContributorsDataset';
import { parse } from 'json2csv';

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
    const [showDropdown, setShowDropdown] = useState(false);
    const showDropdownFunc = (_: any) => {
      setShowDropdown(!showDropdown);
    };
    const hideDropdownFunc = (_: any) => {
      setShowDropdown(false);
    };

    const [isDownloadingSequenceList, setIsDownloadingSequenceList] = useState(false);
    const downloadSequenceList = async () => {
      setIsDownloadingSequenceList(true);
      const contributorsDataset = await ContributorsDataset.fromApi(selector);
      const csv = parse(contributorsDataset.getPayload());

      // Download as file
      const element = document.createElement('a');
      const file = new Blob([csv], { type: 'text/csv' });
      element.href = URL.createObjectURL(file);
      element.download = 'sequences.csv';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      setIsDownloadingSequenceList(false);
    };

    return (
      <>
        <Button
          className='mr-2 mt-3'
          size='sm'
          variant='secondary'
          onClick={downloadSequenceList}
          disabled={isDownloadingSequenceList}
        >
          {!isDownloadingSequenceList ? (
            <>
              Sequence list <FaDownload className='inline-block ml-1' />
            </>
          ) : (
            <>Downloading...</>
          )}
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
  }
);
