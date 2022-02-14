import React from 'react';
import styled from 'styled-components';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { ExpandableTextBox } from './ExpandableTextBox';
import * as Sentry from '@sentry/react';
import { ErrorBoundaryFallback } from './ErrorBoundaryFallback';

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
          className={`p-2 shadow-lg w-40 text-center text-sm outline-none rounded-b -mt-1
            ${
              tabConfig.activeTabIndex === index
                ? 'relative bg-white cursor-default border-b-2 border-black font-bold'
                : 'bg-gray-100 text-gray-500'
            }
          `}
          onClick={_ => tabConfig.onNewTabSelect(index)}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

const Title = styled.h1`
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
        {title}
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
      {/* We define the error boundary here because the NamedCard is currently the component that wraps most
       of the charts.*/}
      <Sentry.ErrorBoundary fallback={<ErrorBoundaryFallback />}>
        {description && (
          <div className='pr-3 mb-3 text-gray-500'>
            <ExpandableTextBox text={description} maxChars={60} />
          </div>
        )}
        <ToolbarWrapper className='static sm:absolute'>{toolbar}</ToolbarWrapper>
        <ContentWrapper>{children}</ContentWrapper>
      </Sentry.ErrorBoundary>
    </SelectedCard>
  );
};
