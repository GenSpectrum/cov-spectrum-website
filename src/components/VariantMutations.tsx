import React, { useEffect, useState } from 'react';
import { Country, DateRange, PangolinLineageInformation } from '../services/api-types';
import { dateRangeToDates, getInformationOfPangolinLineage } from '../services/api';
import styled from 'styled-components';
import { MutationName } from './MutationName';
import { ExternalLink } from './ExternalLink';
import { sortListByMutation } from '../helpers/mutation';

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
  const [commonMutationsSort, setCommonMutationsSort] = useState<'proportion' | 'position'>('position');
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
      <div>
        The following (amino acid) mutations are present in at least 20% of the sequences of this variant:
      </div>
      <div className='ml-4'>
        <span
          className={commonMutationsSort === 'proportion' ? 'font-bold' : 'underline cursor-pointer'}
          onClick={() => setCommonMutationsSort('proportion')}
        >
          Sort by proportion
        </span>{' '}
        |{' '}
        <span
          className={commonMutationsSort === 'position' ? 'font-bold' : 'underline cursor-pointer'}
          onClick={() => setCommonMutationsSort('position')}
        >
          Sort by position
        </span>
      </div>
      <MutationList className='list-disc'>
        {(commonMutationsSort === 'proportion'
          ? data.commonMutations.sort((a, b) => b.count - a.count)
          : sortListByMutation(data.commonMutations, x => x.mutation)
        ).map(({ mutation, proportion }) => {
          return (
            <MutationEntry key={mutation}>
              <MutationName mutation={mutation} /> ({(proportion * 100).toFixed(2)}%)
            </MutationEntry>
          );
        })}
      </MutationList>
      <div className='mt-4'>
        The following nucleotide mutations are present in at least 20% of the sequences of this variant (
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
