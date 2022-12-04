import { LapisSelector } from '../../data/LapisSelector';
import { useQuery } from '../../helpers/query-hook';
import { fetchMutationProportions } from '../../data/api-lapis';
import { HtmlPortalNode, InPortal } from 'react-reverse-portal';
import Loader from '../Loader';
import { SequenceType } from '../../data/SequenceType';
import { sortMutationList } from '../../helpers/mutation';

type Props = {
  selector: LapisSelector;
  pangoLineage: string;
  subLineages: string[];
  plotWidth: number;
  portals: Map<string, HtmlPortalNode>;
  sequenceType: SequenceType;
};

export const MutationsGrid = ({
  selector,
  pangoLineage,
  subLineages,
  plotWidth,
  portals,
  sequenceType,
}: Props) => {
  const data = useQuery(
    async signal => {
      // For each sub-lineage of interest X, fetch the mutations for X*
      // Further, given the parent lineage P, fetch the mutations for P* & !X*
      // Let's use as minProportion 0.8 (?)
      // Identify the differences in mutations
      const trueSubLineages = subLineages.filter(sl => sl.endsWith('*'));
      const selectors1 = trueSubLineages.map(sl => ({
        ...selector,
        variant: {
          nextcladePangoLineage: sl,
        },
      }));
      const selectors2 = trueSubLineages.map(sl => ({
        ...selector,
        variant: {
          variantQuery: `nextcladePangoLineage:${pangoLineage}* & !nextcladePangoLineage:${sl}`,
        },
      }));
      const mutations = await Promise.all(
        [...selectors1, ...selectors2].map(s => fetchMutationProportions(s, sequenceType, signal, 0.8))
      );
      const additionalMutationsOfLineages: { lineage: string; mutations: string }[] = [];
      for (let i = 0; i < trueSubLineages.length; i++) {
        const lineage = trueSubLineages[i];
        const lineageMutations = mutations[i].map(m => m.mutation);
        const otherMutations = mutations[trueSubLineages.length + i].map(m => m.mutation);
        const additionalMutationsOfLineage = new Set(lineageMutations);
        otherMutations.forEach(m => additionalMutationsOfLineage.delete(m));
        additionalMutationsOfLineages.push({
          lineage,
          mutations: sortMutationList(sequenceType, [...additionalMutationsOfLineage]).join(', '),
        });
      }
      return additionalMutationsOfLineages;
    },
    [subLineages]
  );

  return (
    <>
      {data.data ? (
        <>
          {data.data.map(d => (
            <>
              {portals.get(d.lineage) && (
                <InPortal key={d.lineage} node={portals.get(d.lineage)!}>
                  <div
                    className='text-center flex justify-center items-center p-2 overflow-hidden'
                    style={{
                      width: plotWidth,
                      height: plotWidth,
                      fontSize: calculateFontSize(d.mutations, plotWidth),
                    }}
                  >
                    {d.mutations}
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

const calculateFontSize = (text: string, plotWidth: number): number => {
  // A VERY naive way to obtain an EXTREMELY rough estimate for a suitable font size
  const numberChars = text.length;
  const availableArea = plotWidth * plotWidth;
  const estimatedFontSize = availableArea / 40 / numberChars;
  return Math.min(40, Math.max(10, estimatedFontSize));
};
