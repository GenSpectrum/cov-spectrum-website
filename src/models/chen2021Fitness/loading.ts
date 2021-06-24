import {
  Chen2021FitnessRequest,
  Chen2021FitnessResponse,
  Chen2021FitnessResponseSchema,
} from './chen2021Fitness-types';
import * as zod from 'zod';
import { OldSampleSelectorSchema } from '../../helpers/sample-selector';
import { useEffect, useState } from 'react';
import { get, isRegion, isWorld } from '../../services/api';
import { dateToString } from './format-value';

export function fillRequestWithDefaults({
  country,
  mutations,
  matchPercentage,
  pangolinLineage,
  samplingStrategy,
}: zod.infer<typeof OldSampleSelectorSchema>): Chen2021FitnessRequest {
  return {
    country,
    mutations,
    matchPercentage,
    pangolinLineage,
    samplingStrategy,
    alpha: 0.95,
    generationTime: 4.8,
    reproductionNumberWildtype: 1,
    plotStartDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    plotEndDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    initialWildtypeCases: 1000,
    initialVariantCases: 100,
  };
}

const getData = async (
  params: Chen2021FitnessRequest,
  signal: AbortSignal
): Promise<Chen2021FitnessResponse | undefined> => {
  const urlSearchParams = new URLSearchParams({
    matchPercentage: params.matchPercentage.toString(),
    alpha: params.alpha.toString(),
    generationTime: params.generationTime.toString(),
    reproductionNumberWildtype: params.reproductionNumberWildtype.toString(),
    plotStartDate: dateToString(params.plotStartDate),
    plotEndDate: dateToString(params.plotEndDate),
    initialWildtypeCases: params.initialWildtypeCases.toString(),
    initialVariantCases: params.initialVariantCases.toString(),
  });
  if (isRegion(params.country)) {
    urlSearchParams.set('region', params.country);
  } else if (!isWorld(params.country)) {
    urlSearchParams.set('country', params.country);
  }
  if (params.mutations?.length) {
    urlSearchParams.set('mutations', params.mutations.join(','));
  }
  if (params.samplingStrategy) {
    urlSearchParams.set('dataType', params.samplingStrategy);
  }
  if (params.pangolinLineage) {
    urlSearchParams.set('pangolinLineage', params.pangolinLineage);
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

interface ModelDataResult {
  modelData?: Chen2021FitnessResponse;
  loading: boolean;
}

export function useModelData(request: Chen2021FitnessRequest): ModelDataResult {
  const [result, setResult] = useState<ModelDataResult>({ loading: true });

  useEffect(() => {
    let isSubscribed = true;
    const controller = new AbortController();
    const signal = controller.signal;

    setResult({ loading: true });

    getData(request, signal)
      .then(modelData => {
        if (isSubscribed) {
          setResult({ modelData, loading: false });
        }
      })
      .catch(e => {
        console.log('Called fetch data error', e);
        if (isSubscribed) {
          setResult({ loading: false });
        }
      });

    return () => {
      isSubscribed = false;
      controller.abort();
    };
  }, [request]);

  return result;
}
