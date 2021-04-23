import React, { useEffect, useState } from 'react';
import { Country, Variant } from '../services/api-types';
import { DateRange, dateRangeToDates, getPangolinLineages, SamplingStrategy } from '../services/api';
import dayjs from 'dayjs';
import styled from 'styled-components';

export interface Props {
  country: Country;
  matchPercentage: number;
  variant: Variant;
  samplingStrategy: SamplingStrategy;
  dateRange: DateRange;
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
  useEffect(() => {
    getPangolinLineages({
      country,
      samplingStrategy,
      pangolinLineage: variant.name,
      dateFrom: dateFrom && dayjs(dateFrom).format('YYYY-MM-DD'),
      dateTo: dateTo && dayjs(dateTo).format('YYYY-MM-DD'),
      mutationsString: variant.mutations.join(','),
      matchPercentage,
    }).then(data => {
      data.sort((a, b) => b.count - a.count);
      const totalSize = data.reduce((total, a) => total + a.count, 0);
      const processed = data.map(d => ({
        ...d,
        proportion: d.count / totalSize,
      }));
      setData(processed);
    });
  }, [country, matchPercentage, variant, samplingStrategy, dateFrom, dateTo]);

  return (
    <>
      <div>Sequences of this variant belong to the following pangolin lineages:</div>
      <LineageList>
        {data
          .sort((a, b) => b.count - a.count)
          .map(({ pangolinLineage, proportion }) => {
            const label = pangolinLineage || 'Unknown';
            return (
              <LineageEntry key={label}>
                {label} ({(proportion * 100).toFixed(2)}%)
              </LineageEntry>
            );
          })}
      </LineageList>
    </>
  );
};
