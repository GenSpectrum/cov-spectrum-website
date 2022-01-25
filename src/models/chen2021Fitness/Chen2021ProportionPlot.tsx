import React from 'react';
import { TitleWrapper } from '../../widgets/common';
import { Plot } from '../../components/Plot';
import { Chen2021FitnessResponse } from './chen2021Fitness-types';
import { formatValueWithCI } from './format-value';

interface Props {
  modelData: Chen2021FitnessResponse;
  plotStartDate: Date;
  plotEndDate: Date;
  showLegend?: boolean;
}

export const Chen2021ProportionPlot = ({ modelData, showLegend = true }: Props) => {
  const plotProportionText = [];
  const plotProportion = modelData.estimatedProportions;
  for (let i = 0; i < plotProportion.t.length; i++) {
    plotProportionText.push(
      formatValueWithCI(
        {
          value: plotProportion.proportion[i],
          ciLower: plotProportion.ciLower[i],
          ciUpper: plotProportion.ciUpper[i],
        },
        2,
        true
      )
    );
  }

  return (
    <>
      <TitleWrapper id='graph_title'>Estimated proportion through time</TitleWrapper>
      <Plot
        style={{ width: '100%', height: '80%' }}
        data={[
          {
            name: '95% confidence interval',
            showlegend: false,
            line: { color: 'transparent' },
            type: 'scatter',
            mode: 'lines',
            x: modelData.estimatedProportions.t.map(date => date.dayjs.toDate()),
            y: modelData.estimatedProportions.ciUpper,
            hoverinfo: 'x',
          },
          {
            name: '95% confidence interval',
            fill: 'tonexty',
            fillcolor: 'lightgray',
            line: { color: 'transparent' },
            type: 'scatter',
            mode: 'lines',
            x: modelData.estimatedProportions.t.map(date => date.dayjs.toDate()),
            y: modelData.estimatedProportions.ciLower,
            hoverinfo: 'x',
          },
          {
            name: 'Logistic fit',
            type: 'scatter',
            mode: 'lines',
            x: modelData.estimatedProportions.t.map(date => date.dayjs.toDate()),
            y: modelData.estimatedProportions.proportion,
            text: plotProportionText,
            hovertemplate: '%{text}',
          },
          // {
          //   name: 'Estimated daily proportion',
          //   type: 'scatter',
          //   mode: 'markers',
          //   marker: {
          //     size: 4,
          //   },
          //   text: filteredDailyText,
          //   hovertemplate: '%{text}',
          //   x: filteredDaily.t.map(dateString => new Date(dateString)),
          //   y: filteredDaily.proportion,
          // },
        ]}
        layout={{
          xaxis: {
            hoverformat: '%d.%m.%Y',
          },
          showlegend: showLegend,
          margin: {
            l: 30,
            r: 10,
            b: 30,
            t: 0,
            pad: 4,
          },
        }}
        config={{
          displaylogo: false,
          modeBarButtons: [['zoom2d', 'toImage', 'resetScale2d', 'pan2d']],
          responsive: true,
        }}
      />

      <p className='text-gray-500 text-xs'>
        (*) Assumes that the current advantage is due to a transmission advantage. Otherwise, the proportion
        would develop differently.
      </p>
    </>
  );
};
