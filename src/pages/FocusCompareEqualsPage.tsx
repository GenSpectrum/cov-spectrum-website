import { useExploreUrl } from '../helpers/explore-url';
import {
  useMultipleSelectorsFromExploreUrl,
  useSingleSelectorsFromExploreUrl,
} from '../helpers/selectors-from-explore-url-hook';
import React from 'react';
import { formatVariantDisplayName } from '../data/VariantSelector';
import { GridCell, PackedGrid } from '../components/PackedGrid';
import { useQuery } from '../helpers/query-hook';
import { DateCountSampleData } from '../data/sample/DateCountSampleDataset';
import { MultiVariantTimeDistributionLineChart } from '../widgets/MultiVariantTimeDistributionLineChart';
import { NamedCard } from '../components/NamedCard';
import { AnalysisMode } from '../data/AnalysisMode';
import { VariantMutationComparison } from '../components/VariantMutationComparison';

export const FocusCompareEqualsPage = () => {
  const exploreUrl = useExploreUrl()!;

  const { ldvsSelectors } = useMultipleSelectorsFromExploreUrl(exploreUrl);
  const { ldsSelector } = useSingleSelectorsFromExploreUrl(exploreUrl);
  const variantDateCounts = useQuery(
    signal =>
      Promise.all(ldvsSelectors.map(ldvsSelector => DateCountSampleData.fromApi(ldvsSelector, signal))),
    [ldvsSelectors]
  );
  const wholeDateCountWithDateFilter = useQuery(
    signal => DateCountSampleData.fromApi(ldsSelector, signal),
    [ldsSelector]
  );

  return (
    <>
      {/* Code similar to VariantHeader */}
      <div className='pt-10 lg:pt-0 ml-1 md:ml-3 w-full relative'>
        <div className='flex'>
          <div className='flex-grow flex flex-row flex-wrap items-end'>
            <h1 className='md:mr-2'>
              Comparing {exploreUrl.variants?.map(s => formatVariantDisplayName(s)).join(' vs. ')}
            </h1>
          </div>
        </div>
      </div>
      {/* Main content */}
      <div>
        <PackedGrid maxColumns={2}>
          {variantDateCounts.data && wholeDateCountWithDateFilter.data && (
            <GridCell minWidth={600}>
              <NamedCard title='Sequences over time'>
                <div style={{ height: '300px' }}>
                  <MultiVariantTimeDistributionLineChart
                    variantSampleSets={variantDateCounts.data}
                    wholeSampleSet={wholeDateCountWithDateFilter.data}
                    analysisMode={AnalysisMode.CompareEquals}
                  />
                </div>
              </NamedCard>
            </GridCell>
          )}
          {ldvsSelectors.length === 2 && (
            <GridCell minWidth={600}>
              <NamedCard title='Amino acid changes'>
                <VariantMutationComparison selectors={ldvsSelectors} />
              </NamedCard>
            </GridCell>
          )}
        </PackedGrid>
      </div>
    </>
  );
};
