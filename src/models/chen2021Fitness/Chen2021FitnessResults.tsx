import React, { useEffect, useState } from 'react';
import * as zod from 'zod';
import {
  Chen2021FitnessRequest,
  Chen2021FitnessResponseSchema,
  ValueWithCISchema,
} from './chen2021Fitness-types';
import { Plot } from '../../components/Plot';
import { get } from '../../services/api';

type Chen2021FitnessResponse = zod.infer<typeof Chen2021FitnessResponseSchema>;

type ResultsProps = {
  request: Chen2021FitnessRequest;
};

const getData = async (
  params: Chen2021FitnessRequest,
  signal: AbortSignal
): Promise<Chen2021FitnessResponse | undefined> => {
  const mutationsString = params.mutations.join(',');
  const urlSearchParams = new URLSearchParams({
    country: params.country,
    mutations: mutationsString,
    matchPercentage: params.matchPercentage.toString(),
    alpha: params.alpha.toString(),
    generationTime: params.generationTime.toString(),
    reproductionNumberWildtype: params.reproductionNumberWildtype.toString(),
    plotStartDate: params.plotStartDate.toISOString().substring(0, 10),
    plotEndDate: params.plotEndDate.toISOString().substring(0, 10),
    initialWildtypeCases: params.initialWildtypeCases.toString(),
    initialVariantCases: params.initialVariantCases.toString(),
  });
  if (params.samplingStrategy) {
    urlSearchParams.set('dataType', params.samplingStrategy);
  }
  const url = `/computed/model/chen2021Fitness?` + urlSearchParams.toString();
  const response = await get(url, signal);
  if (response.status !== 200) {
    // The computation might fail, for example, if some values go out-of-bound. The issue shall be addressed with the
    // introduction of a better error handling and reporting on the server side.
    return undefined;
  }
  const data = await response.json();
  if (!data) {
    return undefined;
  }
  return Chen2021FitnessResponseSchema.parse(data);
};

const formatValueWithCI = (
  { value, ciLower, ciUpper }: zod.infer<typeof ValueWithCISchema>,
  fractionDigits = 4,
  usePercentSign = false
) => {
  if (usePercentSign) {
    return (
      `${(value * 100).toFixed(fractionDigits)}% ` +
      `[${(ciLower * 100).toFixed(fractionDigits)}%, ${(ciUpper * 100).toFixed(fractionDigits)}%]`
    );
  } else {
    return `${value.toFixed(fractionDigits)} [${ciLower.toFixed(fractionDigits)}, ${ciUpper.toFixed(
      fractionDigits
    )}]`;
  }
};

export const Chen2021FitnessResults = ({ request }: ResultsProps) => {
  const [modelData, setModelData] = useState<Chen2021FitnessResponse | undefined | null>(undefined);

  useEffect(() => {
    let isSubscribed = true;
    const controller = new AbortController();
    const signal = controller.signal;
    getData(request, signal)
      .then(newModelData => {
        if (isSubscribed) {
          setModelData(newModelData);
        }
      })
      .catch(e => {
        console.log('Called fetch data error', e);
      });
    return () => {
      isSubscribed = false;
      controller.abort();
    };
  }, [request]);

  if (!modelData) {
    return <>A fitness advantage cannot be estimated for this variant.</>;
  }

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
    if (d >= request.plotStartDate && d <= request.plotEndDate) {
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
      <div>Logistic growth rate a: {modelData && formatValueWithCI(modelData.params.a)}</div>
      {/*TODO t_0 is currently difficult (or impossible?) to interpret.*/}
      {/*<div>Sigmoid's midpoint t_0: {modelData && formatValueWithCI(modelData.params.t0, 0)}</div>*/}
      <div>Fitness advantage f_c: {modelData && formatValueWithCI(modelData.params.fc)}</div>
      <div>Fitness advantage f_d: {modelData && formatValueWithCI(modelData.params.fd)}</div>
      <div style={{ height: '300px', marginTop: '20px' }}>
        <Plot
          style={{ width: '100%', height: '100%' }}
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
            title: 'Estimated proportion through time',
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
      </div>
      <div style={{ height: '300px', marginTop: '20px' }}>
        <Plot
          style={{ width: '100%', height: '100%' }}
          data={[
            {
              name: 'Wildtype',
              type: 'scatter',
              mode: 'lines',
              x: modelData.plotProportion.t.map(dateString => new Date(dateString)),
              y: modelData.plotAbsoluteNumbers.wildtypeCases,
              stackgroup: 'one',
            },
            {
              name: 'Variant',
              type: 'scatter',
              mode: 'lines',
              x: modelData.plotProportion.t.map(dateString => new Date(dateString)),
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
      </div>
    </>
  );
};
