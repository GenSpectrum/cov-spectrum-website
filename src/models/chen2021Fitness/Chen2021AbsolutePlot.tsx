import React from 'react';
import { Plot } from '../../components/Plot';
import { Chen2021FitnessResponse } from './chen2021Fitness-types';

interface Props {
  modelData: Chen2021FitnessResponse;
}

export const Chen2021AbsolutePlot = ({ modelData }: Props) => {
  return (
    <Plot
      style={{ width: '100%', height: '100%' }}
      data={[
        {
          name: 'Wildtype',
          type: 'scatter',
          mode: 'lines',
          x: modelData.plotAbsoluteNumbers.t.map(dateString => new Date(dateString)),
          y: modelData.plotAbsoluteNumbers.wildtypeCases,
          stackgroup: 'one',
        },
        {
          name: 'Variant',
          type: 'scatter',
          mode: 'lines',
          x: modelData.plotAbsoluteNumbers.t.map(dateString => new Date(dateString)),
          y: modelData.plotAbsoluteNumbers.variantCases,
          stackgroup: 'one',
        },
      ]}
      layout={{
        title: 'Changes in absolute case numbers through time',
        xaxis: {
          hoverformat: '%d.%m.%Y',
        },
      }}
      config={{
        displaylogo: false,
        modeBarButtons: [['zoom2d', 'toImage', 'resetScale2d', 'pan2d']],
        responsive: true,
      }}
    />
  );
};
