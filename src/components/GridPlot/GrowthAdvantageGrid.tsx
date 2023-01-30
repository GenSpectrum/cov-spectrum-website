import { LapisSelector } from '../../data/LapisSelector';
import { HtmlPortalNode, InPortal } from 'react-reverse-portal';
import { useQuery } from '../../helpers/query-hook';
import { fetchDatePangoLineageCount, groupBySubLineage } from './SequencesOverTimeGrid';
import { getModelDataNew } from '../../models/chen2021Fitness/loading';
import Loader from '../Loader';

type Props = {
  selector: LapisSelector;
  pangoLineage: string;
  subLineages: string[];
  plotWidth: number;
  portals: Map<string, HtmlPortalNode>;
};

export const GrowthAdvantageGrid = ({ selector, pangoLineage, subLineages, plotWidth, portals }: Props) => {
  const advantages = useQuery(
    async signal => {
      // Fetch the variant date counts and whole date counts
      const counts = await fetchDatePangoLineageCount({
        ...selector,
        variant: { nextcladePangoLineage: pangoLineage + '*' },
      });
      const variantDateCountsPerPangoLineage = groupBySubLineage({
        currentLineage: pangoLineage,
        datePangoLineageCount: counts.datePangoLineageCount,
      });
      const wholeDateCounts = counts.dateCount;

      // Calculate the relative growth advantage
      return await Promise.all(
        [...variantDateCountsPerPangoLineage.data.entries()]
          .filter(([pangoLineage]) => subLineages.includes(pangoLineage))
          .map(async ([lineage, variantDateCounts]) => {
            const { response } = await getModelDataNew(
              variantDateCounts.data,
              wholeDateCounts,
              { generationTime: 7 },
              signal
            );
            return {
              lineage,
              advantage: response?.params.fd,
            };
          })
      );
    },
    [selector, pangoLineage, subLineages]
  );

  return (
    <>
      {advantages.data ? (
        <>
          {advantages.data.map(d => (
            <>
              {portals.get(d.lineage) && (
                <InPortal key={d.lineage} node={portals.get(d.lineage)!}>
                  <div
                    className='text-center flex flex-column justify-center items-center p-2 overflow-hidden'
                    style={{
                      width: plotWidth,
                      height: plotWidth,
                    }}
                  >
                    {d.advantage ? (
                      <>
                        <div
                          className={`font-bold ${d.advantage.value > 0 ? 'text-red-500' : 'text-green-500'}`}
                        >
                          {(d.advantage.value * 100).toFixed(2)}%
                        </div>
                        <div>
                          [{(d.advantage.ciLower * 100).toFixed(2)}, {(d.advantage.ciUpper * 100).toFixed(2)}]
                        </div>
                      </>
                    ) : (
                      <div>Cannot be calculated</div>
                    )}
                  </div>
                </InPortal>
              )}
            </>
          ))}
        </>
      ) : (
        [...portals].map(([subLineage, portal]) => (
          <InPortal node={portal} key={subLineage}>
            <div style={{ width: plotWidth, height: plotWidth }}>
              <Loader />
            </div>
          </InPortal>
        ))
      )}
    </>
  );
};
