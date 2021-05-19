import React from 'react';
import { Plot } from '../../components/Plot';
import { Chen2021FitnessResponse } from './chen2021Fitness-types';

interface Props {
  modelData: Chen2021FitnessResponse;
}

export const Chen2021AbsolutePlot = ({ modelData }: Props) => {
  return (
    <>
      <Plot
        style={{ width: '100%', height: '90%' }}
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
          title: 'Changes in absolute case numbers through time**',
          xaxis: {
            hoverformat: '%d.%m.%Y',
          },
          margin: {
            l: 50,
            r: 10,
            b: 40,
            t: 40,
            pad: 4,
          },
        }}
        config={{
          displaylogo: false,
          modeBarButtons: [['zoom2d', 'toImage', 'resetScale2d', 'pan2d']],
          responsive: true,
        }}
      />
      <p>
        **) If the estimated advantage is a transmission advantage and if nothing on measures, behavior,
        population immunity, seasonality etc. changes, then the number of cases would develop as shown.
        However, the above-mentioned variables change and thus the plot must be taken as a null model scenario
        rather than a projection of what will happen.
      </p>
    </>
  );
};
