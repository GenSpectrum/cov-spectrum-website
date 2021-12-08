import {
  Chen2021FitnessRequest,
  Chen2021FitnessResponse,
  Chen2021FitnessResponseSchema,
} from './chen2021Fitness-types';
import { useEffect, useState } from 'react';
import { get } from '../../data/api';
import { dateToString } from './format-value';
import { addLocationSelectorToUrlSearchParams, LocationSelector } from '../../data/LocationSelector';
import { addVariantSelectorToUrlSearchParams, VariantSelector } from '../../data/VariantSelector';
import { LocationService } from '../../services/LocationService';
import { addSamplingStrategyToUrlSearchParams, SamplingStrategy } from '../../data/SamplingStrategy';

export function fillRequestWithDefaults({
  locationSelector,
  variantSelector,
  samplingStrategy,
}: {
  locationSelector: LocationSelector;
  variantSelector: VariantSelector;
  samplingStrategy: SamplingStrategy;
}): Chen2021FitnessRequest {
  return {
    location: locationSelector,
    variant: variantSelector,
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
    alpha: params.alpha.toString(),
    generationTime: params.generationTime.toString(),
    reproductionNumberWildtype: params.reproductionNumberWildtype.toString(),
    plotStartDate: dateToString(params.plotStartDate),
    plotEndDate: dateToString(params.plotEndDate),
    initialWildtypeCases: params.initialWildtypeCases.toString(),
    initialVariantCases: params.initialVariantCases.toString(),
  });
  if (params.location.country) {
    params = {
      ...params,
      location: {
        ...params.location,
        country: await LocationService.getGisaidName(params.location.country),
      },
    };
  }
  addLocationSelectorToUrlSearchParams(params.location, urlSearchParams);
  addVariantSelectorToUrlSearchParams(params.variant, urlSearchParams);
  addSamplingStrategyToUrlSearchParams(params.samplingStrategy, urlSearchParams);
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
