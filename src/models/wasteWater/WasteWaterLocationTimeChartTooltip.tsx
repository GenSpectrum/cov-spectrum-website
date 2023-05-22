import { TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { formatDate } from './WasteWaterTimeChart';
import React from 'react';
import { formatCiPercent, formatPercent } from '../../helpers/format-data';
import { deEscapeValueName } from './RechartsKeyConversion';

export const WasteWaterTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
  if (!(active && payload && payload.length > 0)) {
    return null;
  }

  return (
    <div className='custom-tooltip'>
      <div>Date: {formatDate(payload[0].payload.date)}</div>
      <div>
        {payload.map((p: any) => {
          const name = p.name.replace('proportions.', '');
          return (
            <TooltipRow
              key={`tooltipRow${name}`}
              name={name}
              proportion={p.payload.proportions[name]}
              proportionCI={p.payload.proportionCIs[name]}
              color={p.color}
            />
          );
        })}
      </div>
    </div>
  );
};

const TooltipRow = ({
  name,
  proportion,
  proportionCI,
  color,
}: {
  name: string;
  proportion: number;
  proportionCI: [number, number];
  color: string;
}) => {
  function format(name: string, value: number, ci: [number, number]): string {
    return `${deEscapeValueName(name)}: ${formatPercent(value)} ${formatCiPercent(ci)}`;
  }

  return <p style={{ color: color }}>{format(name, proportion, proportionCI)}</p>;
};
