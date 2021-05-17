import React from 'react';
import * as zod from 'zod';
import { Plot } from '../../components/Plot';
import { Chen2021FitnessResponse, Chen2021FitnessResponseSchema } from './chen2021Fitness-types';
import { formatValueWithCI } from './format-value';

interface Props {
  modelData: Chen2021FitnessResponse;
  plotStartDate: Date;
  plotEndDate: Date;
  showLegend?: boolean;
}

export const Chen2021ProportionPlot = ({
  modelData,
  plotStartDate,
  plotEndDate,
  showLegend = true,
}: Props) => {
  const filteredDaily: zod.infer<typeof Chen2021FitnessResponseSchema.shape.daily> = {
    t: [],
    proportion: [],
    ciLower: [],
    ciUpper: [],
  };
  const filteredDailyText = [];
  const daily = modelData.daily;
  for (let i = 0; i < daily.t.length; i++) {
    const d = new Date(daily.t[i]);
    if (d >= plotStartDate && d <= plotEndDate) {
      filteredDaily.t.push(daily.t[i]);
      filteredDaily.proportion.push(daily.proportion[i]);
      filteredDaily.ciLower.push(daily.ciLower[i]);
      filteredDaily.ciUpper.push(daily.ciUpper[i]);
      filteredDailyText.push(
        formatValueWithCI(
          {
            value: daily.proportion[i],
            ciLower: daily.ciLower[i],
            ciUpper: daily.ciUpper[i],
          },
          2,
          true
        )
      );
    }
  }

  const plotProportionText = [];
  const plotProportion = modelData.plotProportion;
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
      <Plot
        style={{ width: '100%', height: '90%' }}
        data={[
          {
            name: '95% confidence interval',
            showlegend: false,
            line: { color: 'transparent' },
            type: 'scatter',
            mode: 'lines',
            x: modelData.plotProportion.t.map(dateString => new Date(dateString)),
            y: modelData.plotProportion.ciUpper,
            hoverinfo: 'x',
          },
          {
            name: '95% confidence interval',
            fill: 'tonexty',
            fillcolor: 'lightgray',
            line: { color: 'transparent' },
            type: 'scatter',
            mode: 'lines',
            x: modelData.plotProportion.t.map(dateString => new Date(dateString)),
            y: modelData.plotProportion.ciLower,
            hoverinfo: 'x',
          },
          {
            name: 'Logistic fit',
            type: 'scatter',
            mode: 'lines',
            x: modelData.plotProportion.t.map(dateString => new Date(dateString)),
            y: modelData.plotProportion.proportion,
            text: plotProportionText,
            hovertemplate: '%{text}',
          },
          {
            name: 'Estimated daily proportion',
            type: 'scatter',
            mode: 'markers',
            marker: {
              size: 4,
            },
            text: filteredDailyText,
            hovertemplate: '%{text}',
            x: filteredDaily.t.map(dateString => new Date(dateString)),
            y: filteredDaily.proportion,
          },
        ]}
        layout={{
          title: 'Estimated proportion through time*',
          xaxis: {
            hoverformat: '%d.%m.%Y',
          },
          showlegend: showLegend,
          margin: {
            l: 30,
            r: 10,
            b: 30,
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
        *) It assumes that the current advantage is due to a transmission advantage. If the reasons for the
        advantage are different, then the proportion should develop differently.
      </p>
    </>
  );
};
