import React from 'react';
import { Nav, Tab } from 'react-bootstrap';
import { KnownVariantsList } from '../components/KnownVariantsList';
import { MutationLookup } from '../components/MutationLookup';
import { NewVariantLookup } from '../components/NewVariantLookup';
import { Country, Variant } from '../services/api-types';
import { NamedSection } from '../components/NamedSection';
import { scrollableContainerStyle } from '../helpers/scrollable-container';
import styled from 'styled-components';

const TabsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const TabContentWrapper = styled.div`
  height: 100px;
  flex-grow: 1;
`;

const ScrollableTabPane = styled.div`
  ${scrollableContainerStyle}
`;

interface Props {
  country: Country;
  onVariantSelect: (selection: { variant: Variant; matchPercentage: number }) => void;
}

export const ExplorePage = ({ country, onVariantSelect }: Props) => {
  return (
    <Tab.Container defaultActiveKey='explore' id='variantList' transition={false} unmountOnExit>
      <TabsWrapper>
        <Nav variant='tabs'>
          <Nav.Item>
            <Nav.Link eventKey='explore'>Explore</Nav.Link>
          </Nav.Item>
        </Nav>
        <Tab.Content as={TabContentWrapper}>
          <Tab.Pane as={ScrollableTabPane} eventKey='explore'>
            <NamedSection title='Known variants'>
              <KnownVariantsList
                country={country}
                onVariantSelect={variant => onVariantSelect({ variant, matchPercentage: 0.8 })}
              />
            </NamedSection>
            <NamedSection title='Potential new variants'>
              <NewVariantLookup
                country={country}
                onVariantSelect={variant => onVariantSelect({ variant, matchPercentage: 1 })}
              />
            </NamedSection>
            <NamedSection title='Search by mutations'>
              <MutationLookup onVariantSelect={onVariantSelect} />
            </NamedSection>
          </Tab.Pane>
        </Tab.Content>
      </TabsWrapper>
    </Tab.Container>
  );
};
