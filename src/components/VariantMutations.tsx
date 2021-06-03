import React, { useEffect, useState } from 'react';
import { Country } from '../services/api-types';
import { DateRange, dateRangeToDates, getInformationOfPangolinLineage } from '../services/api';
import styled from 'styled-components';
import { MutationName } from './MutationName';

export interface Props {
  region?: string;
  country?: Country;
  pangolinLineage: string;
  dateRange: DateRange;
}

const MutationList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
`;

const MutationEntry = styled.li`
  width: 250px;
`;

export const VariantMutations = ({ region, country, pangolinLineage, dateRange }: Props) => {
  const [data, setData] = useState<
    {
      mutation: string;
      count: number;
      proportion: number;
    }[]
  >([]);
  useEffect(() => {
    const { dateFrom, dateTo } = dateRangeToDates(dateRange);
    getInformationOfPangolinLineage({
      pangolinLineage,
      region,
      country,
      dateFrom,
      dateTo,
    }).then(({ commonMutations }) => {
      commonMutations.sort((a, b) => b.count - a.count);
      setData(commonMutations);
    });
  }, [pangolinLineage, region, country, dateRange]);

  return (
    <>
      <div>The following mutations are common to this lineage:</div>
      <MutationList>
        {data
          .sort((a, b) => b.count - a.count)
          .map(({ mutation, proportion }) => {
            return (
              <MutationEntry key={mutation}>
                <MutationName mutation={mutation} /> ({(proportion * 100).toFixed(2)}%)
              </MutationEntry>
            );
          })}
      </MutationList>
    </>
  );
};
