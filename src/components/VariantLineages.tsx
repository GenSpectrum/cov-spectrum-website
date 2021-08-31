import React, { useState } from 'react';
import { Country, PangolinLineageList, Variant } from '../services/api-types';
import {
  DateRange,
  dateRangeToDates,
  getPangolinLineages,
  PromiseWithCancel,
  SamplingStrategy,
} from '../services/api';
import dayjs from 'dayjs';
import styled from 'styled-components';
import { VariantSelector } from '../helpers/sample-selector';
import { useQuery } from 'react-query';
import Loader from './Loader';
import { Alert, AlertVariant } from '../helpers/ui';

export interface Props {
  country: Country;
  matchPercentage: number;
  variant: Variant;
  samplingStrategy: SamplingStrategy;
  dateRange: DateRange;
  onVariantSelect: (selection: VariantSelector) => void;
}

const LineageList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
`;

const LineageEntry = styled.li`
  width: 250px;
`;

export const VariantLineages = ({
  country,
  matchPercentage,
  variant,
  samplingStrategy,
  dateRange,
  onVariantSelect,
}: Props) => {
  // TODO This component is fetching its own data because the pangolinLineages are currently not in variantSampleSet
  //   for two reasons:
  //     1. Further stratifying by pangolinLineage can easily increase the size of the variantSampleSet by ten-fold.
  //     2. It will require a lot of changes that I (Chaoran) am trying to avoid right now.

  const [data, setData] = useState<
    {
      pangolinLineage: string | null;
      count: number;
      proportion: number;
    }[]
  >([]);
  const { dateFrom, dateTo } = dateRangeToDates(dateRange);

  const { isLoading, error, isError, isSuccess, isFetching } = useQuery<PangolinLineageList, Error>(
    ['pangolinLineages', country, matchPercentage, variant, samplingStrategy, dateFrom, dateTo],
    () => {
      const controller = new AbortController();
      const signal = controller.signal;
      const promise = getPangolinLineages(
        {
          country,
          samplingStrategy,
          pangolinLineage: variant.name,
          dateFrom: dateFrom && dayjs(dateFrom).format('YYYY-MM-DD'),
          dateTo: dateTo && dayjs(dateTo).format('YYYY-MM-DD'),
          mutationsString: variant.mutations.join(','),
          matchPercentage,
        },
        signal
      ).then(rawData => {
        rawData.sort((a, b) => b.count - a.count);
        const totalSize = rawData.reduce((total, a) => total + a.count, 0);
        const processed = rawData.map(d => ({
          ...d,
          proportion: d.count / totalSize,
        }));
        setData(processed);
        return rawData;
      });
      (promise as PromiseWithCancel<PangolinLineageList>).cancel = () => controller.abort();
      return promise;
    }
  );

  return (
    <>
      <div>Sequences of this variant belong to the following pangolin lineages:</div>

      {(isLoading || isFetching) && <Loader />}
      {isError && error && <Alert variant={AlertVariant.DANGER}>{error.message}</Alert>}

      <LineageList className='list-disc	'>
        {isSuccess &&
          data &&
          data
            .sort((a, b) => b.count - a.count)
            .map(({ pangolinLineage, proportion }) => {
              const label = pangolinLineage || 'Unknown';
              return (
                <LineageEntry key={label}>
                  {pangolinLineage ? (
                    <button
                      className='underline outline-none'
                      onClick={() =>
                        onVariantSelect({
                          variant: { name: pangolinLineage, mutations: [] },
                          matchPercentage: 1,
                        })
                      }
                    >
                      {pangolinLineage}
                    </button>
                  ) : (
                    'Unknown'
                  )}{' '}
                  ({(proportion * 100).toFixed(2)}%)
                </LineageEntry>
              );
            })}
      </LineageList>
    </>
  );
};
