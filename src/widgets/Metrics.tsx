import React from 'react';
import ReactTooltip from 'react-tooltip';
import { BiHelpCircle } from 'react-icons/bi';
import styled from 'styled-components';

export const METRIC_RIGHT_PADDING_PX = 16;
export const METRIC_WIDTH_PX = 160;
const TOOLTIP_DALAY = 500;

export const MetricsWrapper = ({
  id,
  children,
  className,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      id={id}
      className={`pl-2 pt-3 flex lg:inline flex-row w-full sm:w-auto md:justify-end sm:flex-col sm:pt-0 sm:pl-1 sm:pb-8 ${
        className ? className : ''
      } md:mt-auto`}
    >
      {children}
    </div>
  );
};

export const IconWrapper = ({ id, children }: { id: string; children: React.ReactNode }) => {
  return (
    <div id={id} className='flex items-center pl-1 grow fill-current text-gray-600'>
      {children}
    </div>
  );
};

export const MetricTitleWrapper = ({ id, children }: { id: string; children: React.ReactNode }) => {
  return (
    <div id={id} className='flex text-base text-gray-400 h-7 justify-start'>
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
    <div className='w-auto grow-0 text-xl sm:text-3xl md:text-5xl' style={{ color: color }}>
      {children}
    </div>
  );
};

export const MetricWrapper = ({ id, children }: { id: string; children: React.ReactNode }) => {
  return (
    <div id={id} className='flex flex-col justify-end pr-1 mb-2 overflow-hidden h-full w-auto'>
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

interface ChartAndMetricsProps {
  children: React.ReactNode;
  metrics: MetricProps[];
  title: string;
  metricsTitle?: string | undefined;
  notFullWidth?: boolean | undefined;
}

export const ChartAndMetrics = ({
  children,
  metrics,
  title,
  metricsTitle,
  notFullWidth,
}: ChartAndMetricsProps) => {
  let childrenParentClass: string = 'flex flex-col lg:flex-row h-full';
  let childrenClass: string = 'h-full w-full';
  if (typeof notFullWidth === 'boolean') {
    if (notFullWidth) {
      childrenParentClass = childrenParentClass.replace('h-full', '');
      childrenClass = 'w-full lg:w-2/3';
    }
  }

  return (
    <div id={`chart-and-metrics-${title}`} className='flex flex-col h-full w-full'>
      <h3 id={`chart-title-${title}`} className='my-0 pb-4 pr-10 pt-0 text-gray-500'>
        {title}
      </h3>
      <div className={childrenParentClass}>
        <div className={childrenClass}>{children}</div>
        <MetricsWrapper>
          {metricsTitle && <h3>{metricsTitle}</h3>}
          {metrics.map((mProps, index) => (
            <Metric key={index} {...mProps} />
          ))}
        </MetricsWrapper>
      </div>
    </div>
  );
};

const Metric = ({
  percent = false,
  value,
  title,
  color,
  helpText,
  showPercent,
}: MetricProps): JSX.Element => {
  const tooltipId = 'metric-tooltip-' + title;
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
          <p className='w-auto overflow-clip'>{title + ' '}</p>
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
