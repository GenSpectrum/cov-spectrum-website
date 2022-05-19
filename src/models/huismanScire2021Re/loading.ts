import { EstimatedCasesPlotEntry } from '../../widgets/EstimatedCasesChartInner';
import {
  HuismanScire2021ReCalculateResponse,
  HuismanScire2021ReResult,
  HuismanScire2021ReResultResponse,
} from './types';
import { globalDateCache } from '../../helpers/date-cache';

const endpoint = 'https://cov-spectrum.org/api/v2/computed/model/huismanScire2021Re';

export async function getResult(
  cases: EstimatedCasesPlotEntry[],
  signal?: AbortSignal
): Promise<HuismanScire2021ReResultResponse> {
  const url = endpoint + '/get-result';
  const body = {
    data: cases.map(({ date, estimatedCases }) => ({
      date: date.toISOString().substring(0, 10),
      cases: estimatedCases,
    })),
  };
  const res = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal,
  });
  const rawResultResponse = await res.json();
  return {
    state: rawResultResponse.state,
    result: transformResult(rawResultResponse.result),
  };
}

function transformResult(rawResult: any): HuismanScire2021ReResult | null {
  if (rawResult === null) {
    return null;
  }
  return rawResult.map(({ date, re, re_low, re_high }: any) => ({
    date: globalDateCache.getDay(date),
    re,
    reLow: re_low,
    reHigh: re_high,
  }));
}

export async function triggerCalculation(
  cases: EstimatedCasesPlotEntry[],
  signal?: AbortSignal
): Promise<HuismanScire2021ReCalculateResponse> {
  const url = endpoint + '/calculate';
  const body = {
    data: cases.map(({ date, estimatedCases }) => ({
      date: date.toISOString().substring(0, 10),
      cases: estimatedCases,
    })),
  };
  const res = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal,
  });
  return (await res.json()) as HuismanScire2021ReCalculateResponse;
}
