import React, { useEffect, useState } from 'react';
import { Country, PangolinLineageInformation } from '../services/api-types';
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
  const [data, setData] = useState<PangolinLineageInformation>({
    commonMutations: [],
    commonNucMutations: [],
  });
  const [commonNucMutationsSort, setCommonNucMutationsSort] = useState<'proportion' | 'position'>('position');

  useEffect(() => {
    const { dateFrom, dateTo } = dateRangeToDates(dateRange);
    getInformationOfPangolinLineage({
      pangolinLineage,
      region,
      country,
      dateFrom,
      dateTo,
    }).then(data => {
      setData(data);
    });
  }, [pangolinLineage, region, country, dateRange]);

  return (
    <>
      <div>The following (amino acid) mutations are common to this lineage:</div>
      <MutationList className='list-disc'>
        {data.commonMutations
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
      <div className='ml-4'>
        <span
          className={commonNucMutationsSort === 'proportion' ? 'font-bold' : 'underline cursor-pointer'}
          onClick={() => setCommonNucMutationsSort('proportion')}
        >
          Sort by proportion
        </span>{' '}
        |{' '}
        <span
          className={commonNucMutationsSort === 'position' ? 'font-bold' : 'underline cursor-pointer'}
          onClick={() => setCommonNucMutationsSort('position')}
        >
          Sort by position
        </span>
      </div>
      <MutationList className='list-disc'>
        {data.commonNucMutations
          .sort((a, b) => {
            if (commonNucMutationsSort === 'proportion') {
              return b.count - a.count;
            } else {
              return (
                parseInt(a.mutation.substr(0, a.mutation.length - 1)) -
                parseInt(b.mutation.substr(0, b.mutation.length - 1))
              );
            }
          })
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
