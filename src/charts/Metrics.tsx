import React from 'react';
import ReactTooltip from 'react-tooltip';
import { BiHelpCircle } from 'react-icons/bi';
import styled from 'styled-components';

export const METRIC_RIGHT_PADDING_PX = 32;
export const METRIC_WIDTH_PX = 160;

const TOOLTIP_DALAY = 500;

export const MetricsWrapper = styled.div`
  padding: 0 0 1.7rem 0rem;
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

export const IconWrapper = ({ id, children }: { id: string; children: React.ReactNode }) => {
  return (
    <div id={id} className='flex items-center pl-1 grow'>
    {children}
    </div>
  );
};

export const MetricTitleWrapper = ({ id, children }: { id: string; children: React.ReactNode }) => {
  return (
    <div id={id} className='flex text-base text-gray-400 h-7'>
      {children}
    </div>
  );
};

export const ValueWrapper = ({ color, children }: { color: string | undefined, children: React.ReactNode }) => {
  return (
    <div className='w-auto grow-0 text-3xl md:text-4xl leading-7' style={{color: color}}>
      {children}
    </div>
  );
};

export const MetricWrapper = ({ id, children }: {id: string, children: React.ReactNode }) => {
  return <div id={id} className='flex flex-col justify-end h-full flex-grow pr-4 w-28 md:pr-8 md:w-40'>{children}</div>;
};

const PercentWrapper = styled.div`
  font-size: 1rem;
  width: auto;
  flex-grow: 1;
  line-height: 1;
  color: #95a5a6;
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

const Metric = ({
  percent = false,
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
        <div className="flex w-full">
          <ValueWrapper color={color}>
            {value}
            {percent && '%'}
          </ValueWrapper>
          <PercentWrapper className="self-end">{showPercent && '' + showPercent + '%'}</PercentWrapper>
        </div>
        <MetricTitleWrapper id='metric-title'>
          {title + ' '}
          <IconWrapper id='info-wrapper'>
            <BiHelpCircle />
          </IconWrapper>
        </MetricTitleWrapper>
      </div>
      <ReactTooltip id={tooltipId} delayShow={TOOLTIP_DALAY} />
    </MetricWrapper>
  );
};

export default Metric;
