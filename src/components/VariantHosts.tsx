import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { LoaderSmall } from './Loader';
import { HostCountSampleData } from '../data/sample/HostCountSampleDataset';
import { LapisSelector } from '../data/LapisSelector';

export interface Props {
  selector: LapisSelector;
}

const LineageEntry = styled.li`
  width: 250px;
`;

export const VariantHosts = ({ selector }: Props) => {
  const [data, setData] = useState<
    | {
        host: string | null;
        proportion: number;
      }[]
    | undefined
  >(undefined);

  useEffect(() => {
    HostCountSampleData.fromApi(selector).then(hostCountDataset => {
      const total = hostCountDataset.payload.reduce((prev, curr) => prev + curr.count, 0);
      const proportions = hostCountDataset.payload.map(e => ({
        host: e.host,
        proportion: e.count / total,
      }));
      setData(proportions);
    });
  }, [selector]);

  return (
    <>
      <div>Sequences of this variant were found in the following hosts:</div>

      {!data ? (
        <div className='h-20 w-full flex items-center'>
          <LoaderSmall />
        </div>
      ) : (
        <ul className='list-disc flex flex-wrap max-h-24 overflow-y-auto '>
          {data
            .sort((a, b) => b.proportion - a.proportion)
            .map(({ host, proportion }) => {
              const label = host || 'Unknown';
              return (
                <LineageEntry key={label}>
                  {label} ({(proportion * 100).toFixed(2)}%)
                </LineageEntry>
              );
            })}
        </ul>
      )}
    </>
  );
};
