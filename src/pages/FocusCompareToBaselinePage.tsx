import { useExploreUrl } from '../helpers/explore-url';
import { useMultipleSelectorsFromExploreUrl } from '../helpers/selectors-from-explore-url-hook';
import React, { useState } from 'react';
import { formatVariantDisplayName, transformToVariantQuery } from '../data/VariantSelector';
import { GridCell, PackedGrid } from '../components/PackedGrid';
import { useQuery } from '../helpers/query-hook';
import { DateCountSampleData } from '../data/sample/DateCountSampleDataset';
import { MultiVariantTimeDistributionLineChart } from '../widgets/MultiVariantTimeDistributionLineChart';
import { NamedCard } from '../components/NamedCard';
import { AnalysisMode } from '../data/AnalysisMode';
import { Chen2021FitnessPreview } from '../models/chen2021Fitness/Chen2021FitnessPreview';
import { LocationDateVariantSelector } from '../data/LocationDateVariantSelector';
import { Althaus2021GrowthWidget } from '../models/althaus2021Growth/Althaus2021GrowthWidget';
import { FullSampleAggEntry, FullSampleAggEntryField } from '../data/sample/FullSampleAggEntry';
import { _fetchAggSamples } from '../data/api-lapis';
import { Utils } from '../services/Utils';
import { useDeepCompareMemo } from '../helpers/deep-compare-hooks';
import { DivisionModal } from '../components/DivisionModal';
import { createDivisionBreakdownButton } from './FocusSinglePage';

export const FocusCompareToBaselinePage = () => {
  const exploreUrl = useExploreUrl()!;
  const [showVariantTimeDistributionDivGrid, setShowVariantTimeDistributionDivGrid] = useState(false);

  const baselineVariant = exploreUrl.variants![0];
  const otherVariants = exploreUrl.variants!.slice(1);

  const { ldvsSelectors } = useMultipleSelectorsFromExploreUrl(exploreUrl);
  const variantDateCounts = useQuery(
    signal =>
      Promise.all(ldvsSelectors.map(ldvsSelector => DateCountSampleData.fromApi(ldvsSelector, signal))),
    [ldvsSelectors]
  );

  // Fetch the whole sample set which, in this case, means the union of all selected variant.
  // We only need it for the relative growth advantage widgets, i.e., if exactly two variants are selected.
  const wholeDateCount = useQuery(
    signal => {
      if (ldvsSelectors.length !== 2) {
        return Promise.resolve(undefined);
      }
      const wholeSelector: LocationDateVariantSelector = {
        location: ldvsSelectors[0].location,
        dateRange: ldvsSelectors[0].dateRange,
        samplingStrategy: ldvsSelectors[0].samplingStrategy,
        variant: {
          variantQuery:
            `(${transformToVariantQuery(ldvsSelectors[0].variant!)}) | ` +
            `(${transformToVariantQuery(ldvsSelectors[1].variant!)})`,
        },
      };
      return DateCountSampleData.fromApi(wholeSelector, signal);
    },
    [ldvsSelectors]
  );

  // --- Prepare data for sub-division plots ---
  const splitField = !exploreUrl?.location.country ? 'country' : 'division';
  const generateSplitData = (splitField: 'division' | 'country', plotField: FullSampleAggEntryField) => {
    return {
      // Note: The typings are not entirely correct. The data entries only contain splitField, plotField and count.
      getData: (signal: AbortSignal) =>
        Promise.all(
          ldvsSelectors.map(ldvsSelector => _fetchAggSamples(ldvsSelector, [splitField, plotField], signal))
        ),
      splitData: (variantDatasets: FullSampleAggEntry[][]) => {
        const variantDivisionMaps: Map<string, any[]>[] = [];
        variantDatasets.forEach(variantData => {
          const variantDivisionMap = new Map<string, any[]>();
          variantDivisionMaps.push(variantDivisionMap);
          [...Utils.groupBy(variantData, d => d[splitField]).entries()].forEach(([division, data]) => {
            variantDivisionMap.set(
              division ?? 'Unknown',
              data.map(d => ({
                [plotField]: d[plotField],
                count: d.count,
              }))
            );
          });
        });
        return [...Utils.groupBy(variantDatasets[0] ?? [], d => d[splitField]).entries()]
          .sort((a, b) => (a[0] ?? 'zzz').localeCompare(b[0] ?? 'zzz'))
          .map(([division]) => ({
            division: division ?? 'Unknown',
            data: {
              variant: variantDivisionMaps.map((variantDivisionMap, i) => ({
                selector: {
                  ...ldvsSelectors[i],
                  location: {
                    ...ldvsSelectors[i].location,
                    [splitField]: division,
                  },
                },
                payload: variantDivisionMap.get(division ?? 'Unknown') ?? [],
              })),
            },
          }));
      },
    };
  };

  const splitSequencesOverTime = useDeepCompareMemo(() => generateSplitData(splitField, 'date'), [
    splitField,
    ldvsSelectors,
  ]);

  // --- Rendering ---

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
              <NamedCard
                title='Sequences over time'
                toolbar={[
                  createDivisionBreakdownButton('SequencesOverTime', setShowVariantTimeDistributionDivGrid),
                ]}
              >
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
          {variantDateCounts.data && wholeDateCount.data && (
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
                    wholeDateCounts={wholeDateCount.data}
                  />
                </div>
              </NamedCard>
            </GridCell>
          )}
          {variantDateCounts.data && wholeDateCount.data && (
            <GridCell minWidth={700}>
              <Althaus2021GrowthWidget.ShareableComponent
                title='Relative growth advantage'
                variantDateCounts={variantDateCounts.data[1]}
                wholeDateCounts={wholeDateCount.data}
              />
            </GridCell>
          )}
        </PackedGrid>
      </div>

      {/* The division breakdown plots */}
      {showVariantTimeDistributionDivGrid && (
        <DivisionModal
          getData={splitSequencesOverTime.getData}
          splitData={splitSequencesOverTime.splitData}
          generate={(division, d) => (
            <NamedCard title={division}>
              <div style={{ height: '300px' }}>
                <MultiVariantTimeDistributionLineChart
                  variantSampleSets={d.variant.slice(1)}
                  wholeSampleSet={d.variant[0]}
                  analysisMode={AnalysisMode.CompareEquals}
                />
              </div>
            </NamedCard>
          )}
          show={showVariantTimeDistributionDivGrid}
          handleClose={() => setShowVariantTimeDistributionDivGrid(false)}
          header='Sequences over time'
        />
      )}
    </>
  );
};
