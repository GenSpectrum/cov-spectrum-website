import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { LoaderSmall } from './Loader';
import { LocationDateVariantSelector } from '../data/LocationDateVariantSelector';
import { PangoCountSampleData } from '../data/sample/PangoCountSampleDataset';
import { VariantSelector } from '../data/VariantSelector';

export interface Props {
  selector: LocationDateVariantSelector;
  onVariantSelect: (selection: VariantSelector) => void;
}

const LineageEntry = styled.li`
  width: 250px;
`;

export const VariantLineages = ({ selector, onVariantSelect }: Props) => {
  const [data, setData] = useState<
    | {
        pangoLineage: string | null;
        proportion: number;
      }[]
    | undefined
  >(undefined);

  useEffect(() => {
    PangoCountSampleData.fromApi(selector).then(pangoCountDataset => {
      const total = pangoCountDataset.payload.reduce((prev, curr) => prev + curr.count, 0);
      const proportions = pangoCountDataset.payload.map(e => ({
        pangoLineage: e.pangoLineage,
        proportion: e.count / total,
      }));
      setData(proportions);
    });
  }, [selector]);

  return (
    <>
      <div>Sequences of this variant belong to the following pangolin lineages:</div>

      {!data ? (
        <div className='h-20 w-full flex items-center'>
          <LoaderSmall />
        </div>
      ) : (
        <ul className='list-disc flex flex-wrap max-h-24 overflow-y-auto '>
          {data
            .sort((a, b) => b.proportion - a.proportion)
            .map(({ pangoLineage, proportion }) => {
              const label = pangoLineage || 'Unknown';
              return (
                <LineageEntry key={label}>
                  {pangoLineage ? (
                    <button
                      className='underline outline-none'
                      onClick={() => onVariantSelect({ pangoLineage })}
                    >
                      {pangoLineage}
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
