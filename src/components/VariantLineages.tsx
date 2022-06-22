import React, { useMemo } from 'react';
import styled from 'styled-components';
import { LoaderSmall } from './Loader';
import { VariantSelector } from '../data/VariantSelector';
import { LapisSelector } from '../data/LapisSelector';
import { useQuery } from '../helpers/query-hook';
import { _fetchAggSamples } from '../data/api-lapis';

export interface Props {
  selector: LapisSelector;
  onVariantSelect: (selection: VariantSelector[]) => void;
  type: 'pangoLineage' | 'nextcladePangoLineage' | 'nextstrainClade';
}

const LineageEntry = styled.li`
  width: 250px;
  margin-left: 25px;
`;

export const VariantLineages = ({ selector, onVariantSelect, type }: Props) => {
  const { data } = useQuery(signal => _fetchAggSamples(selector, [type], signal), [selector, type]);

  const distribution:
    | {
        lineage: string | null;
        proportion: number;
      }[]
    | undefined = useMemo(() => {
    if (!data) {
      return undefined;
    }
    const total = data.reduce((prev, curr) => prev + curr.count, 0);
    return data.map(e => ({
      lineage: e[type],
      proportion: e.count / total,
    }));
  }, [data, type]);

  return (
    <>
      {!distribution ? (
        <div className='h-20 w-full flex items-center'>
          <LoaderSmall />
        </div>
      ) : (
        <ul className='list-disc flex flex-wrap max-h-24 overflow-y-auto '>
          {distribution
            .sort((a, b) => b.proportion - a.proportion)
            .map(({ lineage, proportion }) => {
              const label = lineage || 'Unknown';
              return (
                <LineageEntry key={label}>
                  {lineage ? (
                    <button
                      className='underline outline-none'
                      onClick={() => {
                        let variant: VariantSelector;
                        switch (type) {
                          case 'pangoLineage':
                            variant = { pangoLineage: lineage };
                            break;
                          case 'nextcladePangoLineage':
                            variant = { variantQuery: `nextcladePangoLineage:${lineage}` };
                            break;
                          case 'nextstrainClade':
                            variant = { variantQuery: `nextstrainClade:${lineage}` };
                            break;
                          default:
                            throw new Error(`Unexpected lineage type: ${type}`);
                        }
                        onVariantSelect([variant]);
                      }}
                    >
                      {lineage}
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
