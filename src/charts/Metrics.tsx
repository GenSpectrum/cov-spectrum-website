import React from 'react';
import ReactTooltip from 'react-tooltip';
import { BiHelpCircle } from 'react-icons/bi';
import styled from 'styled-components';

export const METRIC_RIGHT_PADDING_PX = 16;
export const METRIC_WIDTH_PX = 160;
const TOOLTIP_DALAY = 500;

// export const MetricsWrapper = styled.div`
//   padding: 0.6rem 0 0 0;
//   flex-grow: 1;
//   display: flex;
//   flex-direction: row;
//   justify-content: space-between;

//   @media (min-width: 640px) {
//     flex-direction: column;
//     padding: 0 0 1.8rem 0rem;
//   }
// `;

export const MetricsWrapper = ({ id, children, className }: { id?: string; children: React.ReactNode, className?: string}) => {
  return (
    <div id={id} className={`pl-1 flex-grow flex flex-row sm:flex-col sm:pb-8 ${className ? className : ""}`}>
      {children}
    </div>
  );
};

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

export const ValueWrapper = ({
  color,
  children,
}: {
  color: string | undefined;
  children: React.ReactNode;
}) => {
  return (
    <div className='w-auto grow-0 text-3xl md:text-5xl' style={{ color: color }}>
      {children}
    </div>
  );
};

export const MetricWrapper = ({ id, children }: { id: string; children: React.ReactNode }) => {
  return (
    <div id={id} className='ml-2 sm:pl-0 flex flex-col justify-end h-full flex-grow w-28 pr-1 md:w-40'>
      {children}
    </div>
  );
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
        <div className='flex w-full'>
          <ValueWrapper color={color}>
            {value}
            {percent && '%'}
          </ValueWrapper>
          <PercentWrapper className='self-end'>{showPercent && '' + showPercent + '%'}</PercentWrapper>
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
