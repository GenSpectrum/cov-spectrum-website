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
import { UsherIntegration } from '../services/external-integrations/UsherIntegration';
import { sequenceDataSource } from '../helpers/sequence-data-source';
import { SampleDetailsDataset } from '../data/SampleDetailsDataset';
import { serializeSampleDetailsEntryToRaw } from '../data/SampleDetailsEntry';

export interface Props {
  selector: LocationDateVariantSelector;
}

const integrations: Integration[] = [
  new WikipediaIntegration(),
  new PangoLineageIntegration(),
  new CoVariantsIntegration(),
  new OutbreakInfoIntegration(),
  new UsherIntegration(),
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

      let csv;
      // If the open version is used, all the metadata will be downloaded. If GISAID is used, only the contributors
      // will be downloaded.
      if (sequenceDataSource === 'open') {
        const detailsDataset = await SampleDetailsDataset.fromApi(selector);
        csv = parse(detailsDataset.getPayload().map(serializeSampleDetailsEntryToRaw));
      } else {
        const contributorsDataset = await ContributorsDataset.fromApi(selector);
        csv = parse(contributorsDataset.getPayload());
      }

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
