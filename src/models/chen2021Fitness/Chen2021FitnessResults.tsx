import React, { useEffect, useState } from 'react';
import { get } from '../../services/api';
import { Chen2021AbsolutePlot } from './Chen2021AbsolutePlot';
import {
  Chen2021FitnessRequest,
  Chen2021FitnessResponse,
  Chen2021FitnessResponseSchema,
} from './chen2021Fitness-types';
import { Chen2021ProportionPlot } from './Chen2021ProportionPlot';
import { formatValueWithCI } from './format-value';

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

  return (
    <>
      <div>Logistic growth rate a: {modelData && formatValueWithCI(modelData.params.a)}</div>
      {/*TODO t_0 is currently difficult (or impossible?) to interpret.*/}
      {/*<div>Sigmoid's midpoint t_0: {modelData && formatValueWithCI(modelData.params.t0, 0)}</div>*/}
      <div>Fitness advantage f_c: {modelData && formatValueWithCI(modelData.params.fc)}</div>
      <div>Fitness advantage f_d: {modelData && formatValueWithCI(modelData.params.fd)}</div>
      <div style={{ height: '300px', marginTop: '20px' }}>
        {
          <Chen2021ProportionPlot
            modelData={modelData}
            plotStartDate={request.plotStartDate}
            plotEndDate={request.plotEndDate}
          />
        }
      </div>
      <div style={{ height: '300px', marginTop: '20px' }}>
        <Chen2021AbsolutePlot modelData={modelData} />
      </div>
    </>
  );
};
