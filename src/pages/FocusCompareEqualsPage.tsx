import { useExploreUrl } from '../helpers/explore-url';
import {
  useMultipleSelectorsFromExploreUrl,
  useSingleSelectorsFromExploreUrl,
} from '../helpers/selectors-from-explore-url-hook';
import React, { useState } from 'react';
import { formatVariantDisplayName } from '../data/VariantSelector';
import { GridCell, PackedGrid } from '../components/PackedGrid';
import { useQuery } from '../helpers/query-hook';
import { DateCountSampleData } from '../data/sample/DateCountSampleDataset';
import { MultiVariantTimeDistributionLineChart } from '../widgets/MultiVariantTimeDistributionLineChart';
import { NamedCard } from '../components/NamedCard';
import { AnalysisMode } from '../data/AnalysisMode';
import { VariantMutationComparison } from '../components/VariantMutationComparison';
import { FullSampleAggEntry, FullSampleAggEntryField } from '../data/sample/FullSampleAggEntry';
import { _fetchAggSamples } from '../data/api-lapis';
import { Utils } from '../services/Utils';
import { useDeepCompareMemo } from '../helpers/deep-compare-hooks';
import { DivisionModal } from '../components/DivisionModal';
import { createDivisionBreakdownButton } from './FocusSinglePage';

export const FocusCompareEqualsPage = () => {
  const exploreUrl = useExploreUrl()!;
  const [showVariantTimeDistributionDivGrid, setShowVariantTimeDistributionDivGrid] = useState(false);

  const { ldvsSelectors } = useMultipleSelectorsFromExploreUrl(exploreUrl);
  const { ldsSelector } = useSingleSelectorsFromExploreUrl(exploreUrl);
  const variantDateCounts = useQuery(
    signal =>
      Promise.all(ldvsSelectors.map(ldvsSelector => DateCountSampleData.fromApi(ldvsSelector, signal))),
    [ldvsSelectors]
  );
  const wholeDateCountWithDateFilter = useQuery(signal => DateCountSampleData.fromApi(ldsSelector, signal), [
    ldsSelector,
  ]);

  // --- Prepare data for sub-division plots ---
  const splitField = !exploreUrl?.location.country ? 'country' : 'division';
  const generateSplitData = (splitField: 'division' | 'country', plotField: FullSampleAggEntryField) => {
    return {
      // Note: The typings are not entirely correct. The data entries only contain splitField, plotField and count.
      getData: (signal: AbortSignal) =>
        Promise.all([
          _fetchAggSamples(ldsSelector, [splitField, plotField], signal), // whole
          ...ldvsSelectors.map(ldvsSelector =>
            _fetchAggSamples(ldvsSelector, [splitField, plotField], signal)
          ), // variant
        ]),
      splitData: (data: FullSampleAggEntry[][]) => {
        const [wholeData, ...variantDatasets] = data;
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
        return [...Utils.groupBy(wholeData, d => d[splitField]).entries()]
          .sort((a, b) => (a[0] ?? 'zzz').localeCompare(b[0] ?? 'zzz'))
          .map(([division, data]) => ({
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
              whole: {
                selector: {
                  ...ldsSelector,
                  location: {
                    ...ldsSelector.location,
                    [splitField]: division,
                  },
                },
                payload: data.map(d => ({
                  [plotField]: d[plotField],
                  count: d.count,
                })) as FullSampleAggEntry[],
              },
            },
          }));
      },
    };
  };

  const splitSequencesOverTime = useDeepCompareMemo(() => generateSplitData(splitField, 'date'), [
    splitField,
    ldvsSelectors,
    ldsSelector,
  ]);

  // --- Rendering ---

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
              <NamedCard
                title='Sequences over time'
                toolbar={[
                  createDivisionBreakdownButton('SequencesOverTime', setShowVariantTimeDistributionDivGrid),
                ]}
              >
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

      {/* The division breakdown plots */}
      {showVariantTimeDistributionDivGrid && (
        <DivisionModal
          getData={splitSequencesOverTime.getData}
          splitData={splitSequencesOverTime.splitData}
          generate={(division, d) => (
            <NamedCard title={division}>
              <div style={{ height: '300px' }}>
                <MultiVariantTimeDistributionLineChart
                  variantSampleSets={d.variant}
                  wholeSampleSet={d.whole}
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
