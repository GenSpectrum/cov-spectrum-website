import React from 'react';
import ReactTooltip from 'react-tooltip';
import { BiHelpCircle } from 'react-icons/bi';
import styled from 'styled-components';

export const METRIC_RIGHT_PADDING_PX = 32;
export const METRIC_WIDTH_PX = 160;

const TOOLTIP_DALAY = 500;

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

const ValueWrapper = styled('div')<{ fontSize: 'small' | 'normal' }>`
  font-size: ${props => (props.fontSize === 'small' ? '2rem' : '3rem')};
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

const PercentWrapper = styled.div`
  font-size: 1rem;
  width: auto;
  flex-grow: 1;
  line-height: 1;
  color: #95a5a6;
  margin-top: 1.8rem;
  margin-left: 0.4rem;
`;

export type MetricProps = {
  value: number | string;
  title: string;
  color?: string;
  helpText: string;
  percent?: string | number | boolean;
  fontSize?: 'normal' | 'small';
  showPercent?: number | string | undefined;
};

const ValueAndPercentWrapper = styled.div`
  display: flex;
`;

const Metric = ({
  percent = false,
  fontSize = 'normal',
  value,
  title,
  color,
  helpText,
  showPercent,
}: MetricProps): JSX.Element => {
  const tooltipId = 'TEST-id' + title;
  return (
    <MetricWrapper id='metric-with-tooltip'>
      <div data-for={tooltipId} data-tip={helpText}>
        <ValueAndPercentWrapper>
          <ValueWrapper color={color} fontSize={fontSize}>
            {value}
            {percent && '%'}
          </ValueWrapper>
          <PercentWrapper>{showPercent && '' + showPercent + '%'}</PercentWrapper>
        </ValueAndPercentWrapper>
        <MetricTitleWrapper id='metric-title'>
          {title + ' '}
          <IconWrapper id='info-wrapper'>
            <BiHelpCircle />
          </IconWrapper>
        </MetricTitleWrapper>
      </div>
      <ReactTooltip id={tooltipId} delayShow={TOOLTIP_DALAY}/>
    </MetricWrapper>
  );
};

export default Metric;
