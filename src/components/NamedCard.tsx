import React from 'react';
import styled from 'styled-components';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { ExpandableTextBox } from './ExpandableTextBox';

export enum NamedCardStyle {
  NORMAL,
  CONFIDENTIAL,
}

interface Props {
  title: string;
  toolbar?: React.ReactChild | React.ReactChild[];
  children: React.ReactChild | React.ReactChild[];
  style?: NamedCardStyle;
  description?: string;
}

const Card = styled.div<{ namedCardStyle: NamedCardStyle }>`
  position: relative;
  margin: 5px;
  background: 'white';
  padding: 12px 15px;
  border: 1px solid #0000001f;
  border: ${props =>
    props.namedCardStyle === NamedCardStyle.NORMAL ? '1px solid #0000001f' : '4px solid #e74c3c'};
  box-shadow: #00000059 0 2px 3px 0px;
`;

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
  margin-bottom: 30px;
`;

export const NamedCard = ({
  title,
  toolbar,
  children,
  style = NamedCardStyle.NORMAL,
  description,
}: Props) => {
  return (
    <Card namedCardStyle={style}>
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
        <div className='px-3 mb-3'>
          <ExpandableTextBox text={description} maxChars={160} />
        </div>
      )}
      <ToolbarWrapper>{toolbar}</ToolbarWrapper>
      <ContentWrapper>{children}</ContentWrapper>
    </Card>
  );
};
