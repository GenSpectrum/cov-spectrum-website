import React from 'react';
import ReactTooltip from 'react-tooltip';
import { BiHelpCircle } from 'react-icons/bi';
import styled from 'styled-components';

export const METRIC_RIGHT_PADDING_PX = 32;
export const METRIC_WIDTH_PX = 160;

export const MetricsWrapper = styled.div`
  padding: 0 0 1.4rem 0rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

export const MetricsSpacing = styled.div`
  display: flex;
  flex-grow: 1;
`;

export const colors = {
  active: '#2980b9',
  inactive: '#bdc3c7',
  active2: '#3498db',
  secondary: '#7f8c8d',
};

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  padding-left: 0.2rem;
  flex-grow: 1;
`;

const MetricTitleWrapper = styled.div`
  font-size: 1rem;
  display: flex;
  color: ${colors.inactive};
  height: 1.6rem;
`;

const ValueWrapper = styled.div`
  font-size: 3rem;
  width: auto;
  flex-grow: 0;
  line-height: 1;
  color: ${props => props.color ?? colors.inactive};
`;

const MetricWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
  padding-right: ${METRIC_RIGHT_PADDING_PX}px;
  width: ${METRIC_WIDTH_PX}px;
  flex: 1;
  flex-grow: 0;
`;

export type MetricProps = {
  value: number | string;
  title: string;
  color?: string;
  helpText: string;
  percent?: string | number | boolean;
};

const Metric = ({ percent = false, value, title, color, helpText }: MetricProps): JSX.Element => {
  const tooltipId = 'TEST-id' + title;
  return (
    <MetricWrapper id='metric-with-tooltip'>
      <div data-for={tooltipId} data-tip={helpText}>
        <ValueWrapper color={color}>
          {value}
          {percent && '%'}
        </ValueWrapper>
        <MetricTitleWrapper id='metric-title'>
          {title + ' '}
          <IconWrapper id='info-wrapper'>
            <BiHelpCircle />
          </IconWrapper>
        </MetricTitleWrapper>
      </div>
      <ReactTooltip id={tooltipId} />
    </MetricWrapper>
  );
};

export default Metric;
