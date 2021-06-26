import React, { useEffect, useState } from 'react';
import { Country } from '../services/api-types';
import { DateRange, dateRangeToDates, getInformationOfPangolinLineage } from '../services/api';
import styled from 'styled-components';
import { MutationName } from './MutationName';
import { ExternalLink } from './ExternalLink';

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
  const [data, setData] = useState<{
    aa: {
      mutation: string;
      count: number;
      proportion: number;
    }[];
    nuc: {
      mutation: string;
      count: number;
      proportion: number;
    }[];
  }>({
    aa: [],
    nuc: [],
  });
  useEffect(() => {
    const { dateFrom, dateTo } = dateRangeToDates(dateRange);
    getInformationOfPangolinLineage({
      pangolinLineage,
      region,
      country,
      dateFrom,
      dateTo,
    }).then(({ commonMutations, commonNucMutations }) => {
      commonMutations.sort((a, b) => b.count - a.count);
      commonNucMutations.sort((a, b) => b.count - a.count);
      setData({
        aa: commonMutations,
        nuc: commonNucMutations,
      });
    });
  }, [pangolinLineage, region, country, dateRange]);

  return (
    <>
      <div>The following (amino acid) mutations are common to this lineage:</div>
      <MutationList className='list-disc'>
        {data.aa
          .sort((a, b) => b.count - a.count)
          .map(({ mutation, proportion }) => {
            return (
              <MutationEntry key={mutation}>
                <MutationName mutation={mutation} /> ({(proportion * 100).toFixed(2)}%)
              </MutationEntry>
            );
          })}
      </MutationList>
      <div className='mt-4'>
        The following nucleotide mutations are common to this lineage (
        <ExternalLink url='https://github.com/W-L/ProblematicSites_SARS-CoV2'>problematic sites</ExternalLink>{' '}
        and leading and tailing deletions are excluded):
      </div>
      <MutationList className='list-disc'>
        {data.nuc
          .sort((a, b) => b.count - a.count)
          .map(({ mutation, proportion }) => {
            return (
              <MutationEntry key={mutation}>
                {mutation} ({(proportion * 100).toFixed(2)}%)
              </MutationEntry>
            );
          })}
      </MutationList>
    </>
  );
};
