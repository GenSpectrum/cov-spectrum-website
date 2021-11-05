import React from 'react';
import styled from 'styled-components';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { ExpandableTextBox } from './ExpandableTextBox';

export enum NamedCardStyle {
  NORMAL,
  CONFIDENTIAL,
}

export type TabConfig = {
  labels: string[];
  activeTabIndex: number;
  onNewTabSelect: (tabIndex: number) => void;
};

interface Props {
  title: string;
  toolbar?: React.ReactChild | React.ReactChild[];
  children: React.ReactChild | React.ReactChild[];
  style?: NamedCardStyle;
  description?: string;
  tabs?: TabConfig;
}

export const Card = ({
  children,
  namedCardStyle,
}: {
  children: React.ReactNode;
  namedCardStyle: NamedCardStyle;
}) => {
  return (
    <div
      className={`relative mx-0.5 mt-1 mb-5 md:mx-3 shadow-lg rounded-lg bg-white p-4  border ${
        namedCardStyle === NamedCardStyle.NORMAL ? ' border-gray-100' : 'border-red-500'
      }`}
    >
      {children}
    </div>
  );
};

export const TabbedCard = ({
                             children,
                             namedCardStyle,
                             tabConfig,
                           }: {
  children: React.ReactNode;
  namedCardStyle: NamedCardStyle;
  tabConfig: TabConfig;
}) => {
  return (
      <div className='mx-0.5 mt-1 mb-5 md:mx-3'>
        <div
            className={`relative shadow-lg rounded-lg bg-white p-4 border ${
                namedCardStyle === NamedCardStyle.NORMAL ? ' border-gray-100' : 'border-red-500'
            }`}
        >
          {children}
        </div>
        {tabConfig.labels.map((label, index) => (
            <button
                key={label}
                className={`p-2 shadow-lg w-40 text-center text-sm outline-none
            ${tabConfig.activeTabIndex === index ? 'relative bg-white cursor-default' : ''}
          `}
                style={
                  tabConfig.activeTabIndex === index
                      ? {
                        borderStyle: 'solid',
                        borderLeftWidth: '1px',
                        borderRightWidth: '1px',
                        borderBottomWidth: '4px',
                        borderColor: 'lightgray',
                        borderBottomColor: 'darkgray',
                      }
                      : {
                        borderStyle: 'solid',
                        borderLeftWidth: '1px',
                        borderRightWidth: '1px',
                        borderBottomWidth: '1px',
                        borderColor: 'lightgray',
                      }
                }
                onClick={_ => tabConfig.onNewTabSelect(index)}
            >
              {label}
            </button>
        ))}
      </div>
  );
};

const Title = styled.h3`
  font-size: 1.5rem;
  margin-top: 0px;
  margin-bottom: 0.5rem;
`;

const TitleConfidential = styled.span`
  font-size: small;
  color: #e74c3c;
  margin-left: 20px;
`;

const ToolbarWrapper = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
`;

const ContentWrapper = styled.div`
  margin-bottom: 0px;
`;

export const NamedCard = ({
  title,
  toolbar,
  children,
  style = NamedCardStyle.NORMAL,
  description,
  tabs,
}: Props) => {
  const SelectedCard = tabs ? TabbedCard : Card;
  return (
    <SelectedCard namedCardStyle={style} tabConfig={tabs!}>
      <Title>
        <h1 className='my-0'>{title}</h1>
        {style === NamedCardStyle.CONFIDENTIAL && (
          <OverlayTrigger
            placement='bottom'
            overlay={
              <Tooltip id='tooltip-confidential'>
                This information is confidential and only available to authorized users.
              </Tooltip>
            }
          >
            <TitleConfidential>(confidential)</TitleConfidential>
          </OverlayTrigger>
        )}
      </Title>
      {description && (
        <div className='pr-3 mb-3 text-gray-500'>
          <ExpandableTextBox text={description} maxChars={60} />
        </div>
      )}
      <ToolbarWrapper>{toolbar}</ToolbarWrapper>
      <ContentWrapper>{children}</ContentWrapper>
    </SelectedCard>
  );
};
