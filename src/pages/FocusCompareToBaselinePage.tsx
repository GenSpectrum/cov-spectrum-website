import { useExploreUrl } from '../helpers/explore-url';
import { useMultipleSelectorsFromExploreUrl } from '../helpers/selectors-from-explore-url-hook';
import React from 'react';
import { formatVariantDisplayName } from '../data/VariantSelector';
import { GridCell, PackedGrid } from '../components/PackedGrid';
import { useQuery } from '../helpers/query-hook';
import { DateCountSampleData } from '../data/sample/DateCountSampleDataset';
import { MultiVariantTimeDistributionLineChart } from '../widgets/MultiVariantTimeDistributionLineChart';
import { NamedCard } from '../components/NamedCard';
import { AnalysisMode } from '../data/AnalysisMode';

export const FocusCompareToBaselinePage = () => {
  const exploreUrl = useExploreUrl()!;

  const baselineVariant = exploreUrl.variants![0];
  const otherVariants = exploreUrl.variants!.slice(1);

  const { ldvsSelectors } = useMultipleSelectorsFromExploreUrl(exploreUrl);
  const variantDateCounts = useQuery(
    signal =>
      Promise.all(ldvsSelectors.map(ldvsSelector => DateCountSampleData.fromApi(ldvsSelector, signal))),
    [ldvsSelectors]
  );

  if (!exploreUrl.variants) {
    return null;
  }

  return (
    <>
      {/* Code similar to VariantHeader */}
      <div className='pt-10 lg:pt-0 ml-1 md:ml-3 w-full relative'>
        <div className='flex'>
          <div className='flex-grow flex flex-row flex-wrap items-end'>
            <h1 className='md:mr-2'>
              Comparing {otherVariants.map(s => formatVariantDisplayName(s)).join(' and ')} to{' '}
              {formatVariantDisplayName(baselineVariant)}
            </h1>
          </div>
        </div>
      </div>
      {/* Main content */}
      <div>
        <PackedGrid maxColumns={2}>
          {variantDateCounts.data && (
            <GridCell minWidth={600}>
              <NamedCard title='Sequences over time'>
                <div style={{ height: '300px' }}>
                  <MultiVariantTimeDistributionLineChart
                    variantSampleSets={variantDateCounts.data.slice(1)}
                    wholeSampleSet={variantDateCounts.data[0]}
                    analysisMode={AnalysisMode.CompareToBaseline}
                  />
                </div>
              </NamedCard>
            </GridCell>
          )}
        </PackedGrid>
      </div>
    </>
  );
};
