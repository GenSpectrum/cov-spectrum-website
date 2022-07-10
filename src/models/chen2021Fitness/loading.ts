import {
  Chen2021FitnessRequest,
  Chen2021FitnessRequestConfigPartial,
  Chen2021FitnessRequestData,
  Chen2021FitnessResponse,
  Chen2021FitnessResponseRawSchema,
} from './chen2021Fitness-types';
import { useMemo } from 'react';
import { globalDateCache, UnifiedDay } from '../../helpers/date-cache';
import { useQuery } from '../../helpers/query-hook';
import { DateCountSampleDataset } from '../../data/sample/DateCountSampleDataset';
import dayjs from 'dayjs';

const endpoint = 'https://cov-spectrum.org/api-chen2021fitness';

export const transformToRequestData = (
  variantDateCounts: DateCountSampleDataset,
  wholeDateCounts: DateCountSampleDataset
): { request: Chen2021FitnessRequestData; t0: UnifiedDay } => {
  // Make sure that there is at least one data point
  if (wholeDateCounts.payload.filter(d => d.date).length === 0) {
    return {
      request: {
        t: [],
        n: [],
        k: [],
      },
      t0: globalDateCache.getDayUsingDayjs(dayjs(new Date())), // It does not really matter what we set here
    };
  }
  // Find out the date that will be mapped to t=0
  const dateRangeInData = globalDateCache.rangeFromDays(
    wholeDateCounts.payload.filter(d => d.date).map(d => d.date!)
  );
  const t0 = wholeDateCounts.selector.dateRange!.getDateRange().dateFrom ?? dateRangeInData!.min;
  // Transform dates to integers and create data object for the request
  const variantDateCountMap = new Map<UnifiedDay, number>();
  for (let { date, count } of variantDateCounts.payload) {
    if (date) {
      variantDateCountMap.set(date, count);
    }
  }
  const data: Chen2021FitnessRequestData = {
    t: [],
    n: [],
    k: [],
  };
  for (let { date, count: wholeCount } of wholeDateCounts.payload) {
    if (date) {
      const variantCount = variantDateCountMap.get(date) ?? 0;
      const t = date.dayjs.diff(t0.dayjs, 'day');
      data.t.push(t);
      data.n.push(wholeCount);
      data.k.push(variantCount);
    }
  }
  return { request: data, t0 };
};

export const fillRequestWithDefaults = (
  data: Chen2021FitnessRequestData,
  config?: Chen2021FitnessRequestConfigPartial
): Chen2021FitnessRequest => {
  if (data.t.length === 0) {
    return {
      data,
      config: {
        alpha: 0.95,
        generationTime: 4.8,
        tStart: 0,
        tEnd: 1,
        reproductionNumberWildtype: 1,
        initialCasesWildtype: 1000,
        initialCasesVariant: 10,
        ...config,
      },
    };
  }
  // Find the min and max t and their corresponding n and k.
  let minT = { t: data.t[0], n: data.n[0], k: data.k[0] };
  let maxT = { t: data.t[0], n: data.n[0], k: data.k[0] };
  for (let i = 0; i < data.t.length; i++) {
    const t = data.t[i];
    if (t < minT.t) {
      minT = { t, n: data.n[i], k: data.k[i] };
    } else if (t > maxT.t) {
      maxT = { t, n: data.n[i], k: data.k[i] };
    }
  }
  // Create request object
  return {
    data,
    config: {
      alpha: 0.95,
      generationTime: 4.8,
      tStart: minT.t,
      tEnd: maxT.t + 14,
      reproductionNumberWildtype: 1,
      initialCasesWildtype: Math.max(minT.n - minT.k, 1),
      initialCasesVariant: Math.max(minT.k, 1),
      ...config,
    },
  };
};

export const getData = async (
  request: Chen2021FitnessRequest,
  t0: UnifiedDay,
  signal?: AbortSignal
): Promise<Chen2021FitnessResponse | undefined> => {
  if (request.data.t.length === 0) {
    return undefined;
  }
  const response = await fetch(endpoint, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
    signal,
  });
  if (response.status !== 200) {
    // The computation might fail, for example, if some values go out-of-bound. The issue shall be addressed with the
    // introduction of a better error handling and reporting on the server side.
    return undefined;
  }
  const data = await response.json();
  if (!data) {
    return undefined;
  }
  const d = Chen2021FitnessResponseRawSchema.parse(data);
  // Map the date integers to UnifiedDates
  if (!d || !t0) {
    return undefined;
  }
  return {
    ...d,
    estimatedAbsoluteNumbers: {
      ...d.estimatedAbsoluteNumbers,
      t: d.estimatedAbsoluteNumbers.t.map(t => globalDateCache.getDayUsingDayjs(t0.dayjs.add(t, 'day'))),
    },
    estimatedProportions: {
      ...d.estimatedProportions,
      t: d.estimatedProportions.t.map(t => globalDateCache.getDayUsingDayjs(t0.dayjs.add(t, 'day'))),
    },
  };
};

type ModelDataResponse = {
  isLoading: boolean;
  data:
    | {
        response: Chen2021FitnessResponse;
        request: Chen2021FitnessRequest;
        t0: UnifiedDay;
      }
    | undefined;
};
export const useModelData = (
  variantDateCounts: DateCountSampleDataset,
  wholeDateCounts: DateCountSampleDataset,
  config?: Chen2021FitnessRequestConfigPartial
): ModelDataResponse => {
  // Create request
  const { request, t0 } =
    useMemo(() => {
      const data = transformToRequestData(variantDateCounts, wholeDateCounts);
      if (!data) {
        return undefined;
      }
      // Fill in defaults
      return { request: fillRequestWithDefaults(data.request, config), t0: data.t0 };
    }, [variantDateCounts, wholeDateCounts, config]) ?? {};
  // Fetch data
  const modelData = useQuery(
    signal => (request && t0 ? getData(request, t0, signal) : Promise.resolve(undefined)),
    [request]
  );
  return {
    isLoading: modelData.isLoading,
    data:
      request && !modelData.isLoading && modelData.data && t0
        ? {
            request,
            response: modelData.data,
            t0,
          }
        : undefined,
  };
};

export const getModelData = async (
  variantDateCounts: DateCountSampleDataset,
  wholeDateCounts: DateCountSampleDataset,
  config?: Chen2021FitnessRequestConfigPartial,
  signal?: AbortSignal
): Promise<{
  response: Chen2021FitnessResponse | undefined;
  request: Chen2021FitnessRequest;
  t0: UnifiedDay;
}> => {
  // Create request
  const data = transformToRequestData(variantDateCounts, wholeDateCounts);
  const request = fillRequestWithDefaults(data.request, config);
  const t0 = data.t0;

  // Fetch data
  let modelData = undefined;
  try {
    modelData = await getData(request, t0, signal);
  } catch (_) {}

  return {
    request,
    response: modelData,
    t0,
  };
};
