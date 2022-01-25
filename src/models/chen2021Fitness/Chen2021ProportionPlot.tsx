import React from 'react';
import { TitleWrapper } from '../../widgets/common';
import { Plot } from '../../components/Plot';
import { Chen2021FitnessResponse } from './chen2021Fitness-types';
import { formatValueWithCI } from './format-value';
import { DateCountSampleDataset } from '../../data/sample/DateCountSampleDataset';
import { UnifiedDay } from '../../helpers/date-cache';
import { calculateWilsonInterval } from '../../helpers/wilson-interval';

interface Props {
  modelData: Chen2021FitnessResponse;
  variantDateCounts: DateCountSampleDataset;
  wholeDateCounts: DateCountSampleDataset;
  plotStartDate: Date;
  plotEndDate: Date;
  showLegend?: boolean;
}

export const Chen2021ProportionPlot = ({
  modelData,
  showLegend = true,
  variantDateCounts,
  wholeDateCounts,
}: Props) => {
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

  const datesAsUnifiedDay = modelData.estimatedProportions.t;
  const dates = datesAsUnifiedDay.map(date => date.dayjs.toDate());

  // Calculate daily proportions
  const dailyMap = new Map<UnifiedDay, { variant: number; whole: number }>();
  for (let date of datesAsUnifiedDay) {
    dailyMap.set(date, { variant: 0, whole: 0 });
  }
  for (let { date, count } of variantDateCounts.payload) {
    if (date && dailyMap.has(date)) {
      dailyMap.get(date)!.variant = count;
    }
  }
  for (let { date, count } of wholeDateCounts.payload) {
    if (date && dailyMap.has(date)) {
      dailyMap.get(date)!.whole = count;
    }
  }
  const dailyProportions: number[] = [];
  const dailyProportionsText: string[] = [];
  for (let date of datesAsUnifiedDay) {
    const { variant, whole } = dailyMap.get(date)!;
    const proportion = variant / whole;
    dailyProportions.push(proportion);
    let text = '';
    if (whole > 0) {
      const [ciLower, ciUpper] = calculateWilsonInterval(variant, whole);
      text = `${(proportion * 100).toFixed(2)}% [${(ciLower * 100).toFixed(2)}%, ${(ciUpper * 100).toFixed(
        2
      )}%]`;
    }
    dailyProportionsText.push(text);
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
            x: dates,
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
            x: dates,
            y: modelData.estimatedProportions.ciLower,
            hoverinfo: 'x',
          },
          {
            name: 'Logistic fit',
            type: 'scatter',
            mode: 'lines',
            x: dates,
            y: modelData.estimatedProportions.proportion,
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
            text: dailyProportionsText,
            hovertemplate: '%{text}',
            x: dates,
            y: dailyProportions,
          },
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
