import { useExploreUrl } from '../helpers/explore-url';
import { useMultipleSelectorsFromExploreUrl } from '../helpers/selectors-from-explore-url-hook';
import React from 'react';
import { formatVariantDisplayName } from '../data/VariantSelector';
import { GridCell, PackedGrid } from '../components/PackedGrid';
import { useQuery } from '../helpers/query-hook';
import { DateCountSampleData, DateCountSampleDataset } from '../data/sample/DateCountSampleDataset';
import { MultiVariantTimeDistributionLineChart } from '../widgets/MultiVariantTimeDistributionLineChart';
import { NamedCard } from '../components/NamedCard';
import { AnalysisMode } from '../data/AnalysisMode';
import { Chen2021FitnessPreview } from '../models/chen2021Fitness/Chen2021FitnessPreview';
import { LocationDateVariantSelector } from '../data/LocationDateVariantSelector';
import { SamplingStrategy } from '../data/SamplingStrategy';
import { UnifiedDay } from '../helpers/date-cache';
import { DateCountSampleEntry } from '../data/sample/DateCountSampleEntry';
import { Althaus2021GrowthWidget } from '../models/althaus2021Growth/Althaus2021GrowthWidget';

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
            // We have a very large width here to ensure that the two relative growth rate plots will start on the
            // second row.
            <GridCell minWidth={9999}>
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
          {variantDateCounts.data?.length === 2 && (
            <GridCell minWidth={600}>
              <NamedCard
                title='Relative growth advantage'
                description={`
      If variants spread pre-dominantly by local transmission across demographic groups, this estimate reflects 
      the relative growth advantage of the focal variant. Importantly, the relative growth advantage estimate 
      reflects the advantage compared to the baseline variant. Many factors can contribute to a growth advantage, 
      including an intrinsic  transmission advantage and immune evasion. When absolute numbers of a variant are low, 
      the advantage may merely reflect the current importance of introductions from abroad or the variant spreading 
      in a particular demographic group. In this case, the estimate does not provide information on any intrinsic 
      fitness advantages.`}
              >
                <div style={{ height: 400 }}>
                  <Chen2021FitnessPreview
                    variantDateCounts={variantDateCounts.data[1]}
                    wholeDateCounts={addDateCounts(variantDateCounts.data[0], variantDateCounts.data[1])}
                  />
                </div>
              </NamedCard>
            </GridCell>
          )}
          {variantDateCounts.data?.length === 2 && (
            <GridCell minWidth={700}>
              <Althaus2021GrowthWidget.ShareableComponent
                title='Relative growth advantage'
                variantDateCounts={variantDateCounts.data[1]}
                wholeDateCounts={addDateCounts(variantDateCounts.data[0], variantDateCounts.data[1])}
              />
            </GridCell>
          )}
        </PackedGrid>
      </div>
    </>
  );
};

/**
 * TODO: The selector of the returned dataset is wrong.
 * To fix it, the variant selector of both datasets should be transformed to complex queries (i.e., to "variantQuery").
 * The two queries can then be joined with a OR-condition.
 * TODO: It should only be allowed to add datasets with the same location-, samplingStrategy-, and dateRange-filter
 */
function addDateCounts(
  dataset1: DateCountSampleDataset,
  dataset2: DateCountSampleDataset
): DateCountSampleDataset {
  const selector: LocationDateVariantSelector = {
    location: { country: 'placeholder' },
    variant: { pangoLineage: 'placeholder' },
    samplingStrategy: SamplingStrategy.AllSamples,
    dateRange: dataset1.selector.dateRange,
  };
  let nullCount = 0;
  const dateMap = new Map<UnifiedDay, number>();
  for (let { date, count } of [...dataset1.payload, ...dataset2.payload]) {
    if (date === null) {
      nullCount += count;
    } else {
      dateMap.set(date, (dateMap.get(date) ?? 0) + count);
    }
  }
  const payload: DateCountSampleEntry[] = [];
  for (let [date, count] of dateMap.entries()) {
    payload.push({ date, count });
  }
  if (nullCount > 0) {
    payload.push({ date: null, count: nullCount });
  }
  return { selector, payload };
}
