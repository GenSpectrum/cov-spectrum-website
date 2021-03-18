import React from 'react';
import { Nav, Tab } from 'react-bootstrap';
import styled from 'styled-components';
import { scrollableContainerStyle } from '../helpers/scrollable-container';

const TabsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledNav = styled.div`
  padding-top: 5px;
  padding-left: 15px;
  border-bottom: none;

  .nav-link {
    box-shadow: #00000036 0px 2px 5px;
  }
`;

const StyledTabContent = styled.div`
  height: 100px;
  flex-grow: 1;
  box-shadow: #00000036 0px 2px 5px;
  background: white;
  border: 1px solid #0000001f;
  border-radius: 3px;
`;

const ScrollableTabPane = styled.div`
  ${scrollableContainerStyle}
`;

interface Props {
  tabs: TabDefinition[];
}

export interface TabDefinition {
  key: string;
  title: string;
  content: React.ReactChild | React.ReactChild[];
}

export const ScrollableTabs = ({ tabs }: Props) => {
  return (
    <Tab.Container defaultActiveKey='explore' id='variantList' transition={false} unmountOnExit>
      <TabsWrapper>
        <Nav as={StyledNav} variant='tabs'>
          {tabs.map(tab => (
            <Nav.Item key={tab.key}>
              <Nav.Link eventKey={tab.key}>{tab.title}</Nav.Link>
            </Nav.Item>
          ))}
        </Nav>
        <Tab.Content as={StyledTabContent}>
          {tabs.map(tab => (
            <Tab.Pane as={ScrollableTabPane} key={tab.key} eventKey={tab.key}>
              {tab.content}
            </Tab.Pane>
          ))}
        </Tab.Content>
      </TabsWrapper>
    </Tab.Container>
  );
};
