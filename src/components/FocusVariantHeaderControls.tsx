import React from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import { ButtonGroup, DropdownButton } from 'react-bootstrap';
import { Integration } from '../services/external-integrations/Integration';
import { PangoLineageIntegration } from '../services/external-integrations/PangoLineageIntegration';
import { OutbreakInfoIntegration } from '../services/external-integrations/OutbreakInfoIntegration';
import { WikipediaIntegration } from '../services/external-integrations/WikipediaIntegration';
import { CoVariantsIntegration } from '../services/external-integrations/CoVariantsIntegration';
import { useState } from 'react';
import { FaDownload } from 'react-icons/fa';
import { UsherIntegration } from '../services/external-integrations/UsherIntegration';
import { sequenceDataSource } from '../helpers/sequence-data-source';
import { TaxoniumIntegration } from '../services/external-integrations/TaxoniumIntegration';
import { getCsvLinkToContributors, getCsvLinkToDetails, getLinkToFasta } from '../data/api-lapis';
import { ExternalLink } from './ExternalLink';
import { useDeepCompareMemo } from '../helpers/deep-compare-hooks';
import { useAsync } from 'react-async';
import { OrderAndLimitConfig } from '../data/OrderAndLimitConfig';
import { NextcladeIntegration } from '../services/external-integrations/NextcladeIntegration';
import { LapisSelector } from '../data/LapisSelector';

export interface Props {
  selector: LapisSelector;
}

const integrations: Integration[] = [
  new WikipediaIntegration(),
  new PangoLineageIntegration(),
  new CoVariantsIntegration(),
  new OutbreakInfoIntegration(),
  new UsherIntegration(),
  new TaxoniumIntegration(),
  new NextcladeIntegration(),
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

    // Sequence list download
    // If the open version is used, all the metadata will be downloaded. If GISAID is used, only the contributors
    // will be downloaded.
    const getLinkFunc = sequenceDataSource === 'open' ? getCsvLinkToDetails : getCsvLinkToContributors;
    const linkToListPromise = useDeepCompareMemo(() => getLinkFunc(selector), [selector]);
    const { data: listLink } = useAsync({ promise: linkToListPromise });

    // FASTA download
    const orderAndLimit: OrderAndLimitConfig = {
      orderBy: 'random',
      limit: 10000,
    };
    const linkToFastaPromise = useDeepCompareMemo(() => getLinkToFasta(false, selector, orderAndLimit), [
      selector,
    ]);
    const { data: fastaLink } = useAsync({ promise: linkToFastaPromise });
    const linkToAlignedFastaPromise = useDeepCompareMemo(
      () => getLinkToFasta(true, selector, orderAndLimit),
      [selector]
    );
    const { data: alignedFastaLink } = useAsync({ promise: linkToAlignedFastaPromise });

    const listLink2: string | undefined =
      listLink &&
      listLink.replace('contributors', 'gisaid-epi-isl').replace('&downloadAsFile=true&dataFormat=csv', '') +
        '&orderBy=random';

    return (
      <>
        <Dropdown as={ButtonGroup} className='mr-2 mt-3' size='sm'>
          <ExternalLink url={listLink ?? ''}>
            <Button variant='secondary' size='sm'>
              Sequence list <FaDownload className='inline-block ml-1' />
            </Button>
          </ExternalLink>
          <ExternalLink url={listLink2 ?? ''}>
            <Button variant='secondary' size='sm' className='ml-1'>
              GISAID list
            </Button>
          </ExternalLink>
          {sequenceDataSource === 'open' && (
            <>
              <Dropdown.Toggle split variant='secondary' />
              <Dropdown.Menu>
                <ExternalLink url={fastaLink ?? ''}>
                  <Dropdown.Item as={Button}>FASTA</Dropdown.Item>
                </ExternalLink>
                <ExternalLink url={alignedFastaLink ?? ''}>
                  <Dropdown.Item as={Button}>FASTA (aligned)</Dropdown.Item>
                </ExternalLink>
              </Dropdown.Menu>
            </>
          )}
        </Dropdown>

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
