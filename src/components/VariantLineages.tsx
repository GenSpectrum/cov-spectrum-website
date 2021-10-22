import React, { useState } from 'react';
import { Country, DateRange, PangolinLineageList, Variant } from '../services/api-types';
import { dateRangeToDates, getPangolinLineages, PromiseWithCancel, SamplingStrategy } from '../services/api';
import dayjs from 'dayjs';
import styled from 'styled-components';
import { VariantSelector } from '../helpers/sample-selector';
import { useQuery } from 'react-query';
import { LoaderSmall } from './Loader';
import { Alert, AlertVariant } from '../helpers/ui';

export interface Props {
  country: Country;
  matchPercentage: number;
  variant: Variant;
  samplingStrategy: SamplingStrategy;
  dateRange: DateRange;
  onVariantSelect: (selection: VariantSelector) => void;
}

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
  const dateFromString = dateFrom && dayjs(dateFrom).format('YYYY-MM-DD');
  const dateToString = dateTo && dayjs(dateTo).format('YYYY-MM-DD');

  const { isLoading, error, isError, isSuccess, isFetching } = useQuery<PangolinLineageList, Error>(
    ['pangolinLineages', country, matchPercentage, variant, samplingStrategy, dateFromString, dateToString],
    () => {
      const controller = new AbortController();
      const signal = controller.signal;
      const promise = getPangolinLineages(
        {
          country,
          samplingStrategy,
          pangolinLineage: variant.name,
          dateFrom: dateFromString,
          dateTo: dateToString,
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

      {isError && error && <Alert variant={AlertVariant.DANGER}>{error.message}</Alert>}

      {isLoading || isFetching ? (
        <div className='h-20 w-full flex items-center'>
          <LoaderSmall />
        </div>
      ) : (
        <ul className='list-disc flex flex-wrap max-h-24 overflow-y-auto '>
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
        </ul>
      )}
    </>
  );
};
