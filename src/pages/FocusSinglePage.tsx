import React, { useEffect, useMemo, useState } from 'react';
import { useExploreUrl } from '../helpers/explore-url';
import { useQuery } from '../helpers/query-hook';
import { DateCountSampleData } from '../data/sample/DateCountSampleDataset';
import Loader from '../components/Loader';
import { CoreMetrics } from '../components/CoreMetrics';
import { VariantLineages } from '../components/VariantLineages';
import { GridCell, PackedGrid } from '../components/PackedGrid';
import { VariantTimeDistributionChartWidget } from '../widgets/VariantTimeDistributionChartWidget';
import { EstimatedCasesChartWidget } from '../widgets/EstimatedCasesChartWidget';
import { VariantInternationalComparisonChartWidget } from '../widgets/VariantInternationalComparisonChartWidget';
import { VariantDivisionDistributionChartWidget } from '../widgets/VariantDivisionDistributionChartWidget';
import { DivisionCountSampleData } from '../data/sample/DivisionCountSampleDataset';
import { NamedCard } from '../components/NamedCard';
import {
  Chen2021FitnessExplanation,
  Chen2021FitnessPreview,
} from '../models/chen2021Fitness/Chen2021FitnessPreview';
import { Althaus2021GrowthWidget } from '../models/althaus2021Growth/Althaus2021GrowthWidget';
import { VariantAgeDistributionChartWidget } from '../widgets/VariantAgeDistributionChartWidget';
import { AgeCountSampleData } from '../data/sample/AgeCountSampleDataset';
import { VariantMutations } from '../components/VariantMutations';
import { CaseCountAsyncDataset, CaseCountData } from '../data/CaseCountDataset';
import { useAsyncDataset } from '../helpers/use-async-dataset';
import { Button, ButtonVariant, ShowMoreButton } from '../helpers/ui';
import { CountryDateCountSampleData } from '../data/sample/CountryDateCountSampleDataset';
import { VariantHeader } from '../components/VariantHeader';
import { FocusVariantHeaderControls } from '../components/FocusVariantHeaderControls';
import { DivisionModal } from '../components/DivisionModal';
import { _fetchAggSamples } from '../data/api-lapis';
import { FullSampleAggEntry, FullSampleAggEntryField } from '../data/sample/FullSampleAggEntry';
import { Utils } from '../services/Utils';
import { useDeepCompareMemo } from '../helpers/deep-compare-hooks';
import { WasteWaterDataset } from '../models/wasteWater/types';
import { filter, getData } from '../models/wasteWater/loading';
import { WasteWaterSummaryTimeWidget } from '../models/wasteWater/WasteWaterSummaryTimeWidget';
import { HospDiedAgeSampleData } from '../data/sample/HospDiedAgeSampleDataset';
import { HospitalizationDeathChartWidget } from '../widgets/HospitalizationDeathChartWidget';
import {
  SingleSelectorsFromExploreUrlHook,
  useSingleSelectorsFromExploreUrl,
} from '../helpers/selectors-from-explore-url-hook';
import { ErrorBoundaryFallback } from '../components/ErrorBoundaryFallback';
import * as Sentry from '@sentry/react';
import { isDefaultHostSelector } from '../data/HostSelector';
import { VariantHosts } from '../components/VariantHosts';
import { HuismanScire2021ReContainer } from '../models/huismanScire2021Re/HuismanScire2021ReContainer';
import { ErrorAlert } from '../components/ErrorAlert';
import { VariantInsertions } from '../components/VariantInsertions';
import * as lodashAlternatives from '../helpers/lodash_alternatives';
import { VariantMutationsTimelines } from '../components/VariantMutationsTimelines';
import { wastewaterVariantColors } from '../models/wasteWater/constants';
import { WidgetWrapper } from '../components/WidgetWrapper';
import { VariantSelector } from '../data/VariantSelector';
import { AnalysisMode } from '../data/AnalysisMode';
import { NucleotideEntropy } from '../components/NucleotideEntropy/NucleotideEntropy';
// Due to missing additional data, we are currently not able to maintain some of our Swiss specialties.
const SWISS_SPECIALTIES_ACTIVATED = false;

export const FocusSinglePage = () => {
  const exploreUrl = useExploreUrl();

  // Deep focus buttons
  const deepFocusButtons: { [p: string]: JSX.Element } = useMemo(
    () =>
      lodashAlternatives.mapValues(deepFocusPaths, (suffix: string) => (
        <ShowMoreButton key={suffix} to={exploreUrl?.getDeepFocusPageUrl(suffix) ?? '#'} />
      )),
    [exploreUrl]
  );

  const selectors = useSingleSelectorsFromExploreUrl(exploreUrl!);

  return (
    <FocusSinglePageContent
      selectors={selectors}
      deepFocusButtons={deepFocusButtons}
      setVariants={exploreUrl?.setVariants}
    />
  );
};

export const createDivisionBreakdownButton = (key: string, setter: (show: boolean) => void) => (
  <Button
    key={key}
    className='mt-1 ml-4 w-max'
    variant={ButtonVariant.PRIMARY}
    onClick={() => {
      setter(true);
    }}
  >
    Show regions
  </Button>
);

const deepFocusPaths = {
  internationalComparison: '/international-comparison',
  chen2021Fitness: '/chen-2021-fitness',
  hospitalizationAndDeath: '/hospitalization-death',
  wasteWater: '/waste-water',
};

type FocusSinglePageContentProps = {
  selectors: SingleSelectorsFromExploreUrlHook;
  deepFocusButtons?: { [p: string]: JSX.Element };
  setVariants?: (variants: VariantSelector[], analysisMode?: AnalysisMode) => void;
};

export const MUTATIONS_HASH_LINK = 'mutations';

export const FocusSinglePageContent = ({
  selectors,
  deepFocusButtons,
  setVariants,
}: FocusSinglePageContentProps) => {
  const { ldvsSelector, ldsSelector, dvsSelector, dsSelector, lSelector } = selectors;

  const [lineageDistributionIndex, setLineageDistributionIndex] = useState(1);
  const [showVariantTimeDistributionDivGrid, setShowVariantTimeDistributionDivGrid] = useState(false);
  const [showEstimatedCasesDivGrid, setShowEstimatedCasesDivGrid] = useState(false);
  const [showVariantAgeDistributionDivGrid, setShowVariantAgeDistributionDivGrid] = useState(false);
  const [showChen2021FitnessDivGrid, setShowChen2021FitnessDivGrid] = useState(false);

  // Date counts
  const variantDateCount = useQuery(
    signal => DateCountSampleData.fromApi(ldvsSelector, signal),
    [ldvsSelector]
  );
  const wholeDateCountWithDateFilter = useQuery(
    signal => DateCountSampleData.fromApi(ldsSelector, signal),
    [ldsSelector]
  );
  const variantInternationalDateCount = useQuery(
    signal => CountryDateCountSampleData.fromApi(dvsSelector, signal),
    [dvsSelector]
  );
  const wholeInternationalDateCount = useQuery(
    signal => CountryDateCountSampleData.fromApi(dsSelector, signal),
    [dsSelector]
  );
  // Age counts
  const variantAgeCount = useQuery(
    signal => AgeCountSampleData.fromApi(ldvsSelector, signal),
    [ldvsSelector]
  );
  const wholeAgeCount = useQuery(
    // Used by the focus page
    signal => AgeCountSampleData.fromApi(ldsSelector, signal),
    [ldsSelector]
  );
  // Division counts
  const variantDivisionCount = useQuery(
    signal => DivisionCountSampleData.fromApi(ldvsSelector, signal),
    [ldvsSelector]
  );
  const wholeDivisionCount = useQuery(
    signal => DivisionCountSampleData.fromApi(ldsSelector, signal),
    [ldsSelector]
  );

  // Hospitalization and death
  const variantHospDeathAgeCount = useQuery(
    signal => HospDiedAgeSampleData.fromApi(ldvsSelector, signal),
    [ldvsSelector]
  );
  const wholeHospDeathAgeCount = useQuery(
    signal => HospDiedAgeSampleData.fromApi(ldsSelector, signal),
    [ldsSelector]
  );

  // Cases
  const caseCountDataset: CaseCountAsyncDataset = useAsyncDataset(lSelector, ({ selector }, { signal }) =>
    CaseCountData.fromApi(selector, signal)
  );

  // Wastewater
  const [wasteWaterData, setWasteWaterData] = useState<WasteWaterDataset | undefined>(undefined);
  const pangoLineageWithoutAsterisk = ldvsSelector.variant?.pangoLineage?.replace('*', '');
  useEffect(() => {
    let isMounted = true;
    const country = ldvsSelector.location.country;
    if (!pangoLineageWithoutAsterisk || !country) {
      return;
    }
    getData({ country }).then(
      dataset => isMounted && dataset && setWasteWaterData(filter(dataset, pangoLineageWithoutAsterisk))
    );

    return () => {
      isMounted = false;
    };
  }, [ldvsSelector.location.country, pangoLineageWithoutAsterisk]);

  // --- Prepare data for sub-division plots ---
  // If this is not a country page, the sub-plots will be split by countries. Otherwise, they should be split by
  // divisions.
  const splitField = !ldvsSelector.location.country ? 'country' : 'division';
  // Split case data
  const caseCountDatasetSplit = useMemo(() => {
    if (!caseCountDataset.payload) {
      return undefined;
    }
    return CaseCountData.split(
      { selector: caseCountDataset.selector, payload: caseCountDataset.payload },
      e => e[splitField] ?? 'Unknown',
      (oldSelector, entry) => ({
        ...oldSelector,
        location: {
          ...oldSelector.location,
          division: entry.division ?? undefined,
        },
      })
    );
  }, [caseCountDataset, splitField]);
  // Function to split by a single field in FullSampleAggEntry.
  const generateSplitData = (splitField: 'division' | 'country', plotField: FullSampleAggEntryField) => {
    return {
      // Note: The typings are not entirely correct. The data entries only contain splitField, plotField and count.
      getData: (signal: AbortSignal) =>
        Promise.all([
          _fetchAggSamples(ldvsSelector, [splitField, plotField], signal), // variant
          _fetchAggSamples(ldsSelector, [splitField, plotField], signal), // whole
        ]),
      splitData: (data: FullSampleAggEntry[][]) => {
        const [variantData, wholeData] = data;
        const variantDivisionMap = new Map<string, any[]>();
        [...Utils.groupBy(variantData, d => d[splitField]).entries()].forEach(([division, data]) => {
          variantDivisionMap.set(
            division ?? 'Unknown',
            data.map(d => ({
              [plotField]: d[plotField],
              count: d.count,
            }))
          );
        });
        return [...Utils.groupBy(wholeData, d => d[splitField]).entries()]
          .sort((a, b) => (a[0] ?? 'zzz').localeCompare(b[0] ?? 'zzz'))
          .map(([division, data]) => ({
            division: division ?? 'Unknown',
            data: {
              variant: {
                selector: {
                  ...ldvsSelector,
                  location: {
                    ...ldvsSelector.location,
                    [splitField]: division,
                  },
                },
                payload: variantDivisionMap.get(division ?? 'Unknown') ?? [],
              },
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
              cases: caseCountDatasetSplit?.get(division ?? 'Unknown'),
            },
          }));
      },
    };
  };

  const splitSequencesOverTime = useDeepCompareMemo(
    () => generateSplitData(splitField, 'date'),
    [splitField, ldvsSelector, ldsSelector, [...(caseCountDatasetSplit?.keys() ?? [])]]
  );
  const splitAgeDistribution = useDeepCompareMemo(
    () => generateSplitData(splitField, 'age'),
    [splitField, ldvsSelector, ldsSelector]
  );

  // --- Rendering ---

  if (!ldvsSelector.variant) {
    return null;
  }
  const { country } = ldvsSelector.location;
  const host = ldvsSelector.host!;

  // Error handling
  const allErrors = [
    variantDateCount.error,
    wholeDateCountWithDateFilter.error,
    variantAgeCount.error,
    wholeAgeCount.error,
    variantDivisionCount.error,
    wholeDivisionCount.error,
    variantInternationalDateCount.error,
    wholeInternationalDateCount.error,
    variantHospDeathAgeCount.error,
    wholeHospDeathAgeCount.error,
  ].filter(e => !!e) as string[];
  if (allErrors.length > 0) {
    return <ErrorAlert messages={allErrors} />;
  }

  // Wastewater plot
  let wasteWaterSummaryPlot = undefined;
  if (
    country === 'Switzerland' &&
    pangoLineageWithoutAsterisk &&
    wastewaterVariantColors.hasOwnProperty(pangoLineageWithoutAsterisk)
  ) {
    if (wasteWaterData) {
      wasteWaterSummaryPlot = (
        <GridCell minWidth={600}>
          <WasteWaterSummaryTimeWidget.ShareableComponent
            country={country}
            title='Wastewater prevalence'
            variantName={pangoLineageWithoutAsterisk}
            wasteWaterPlants={wasteWaterData.map(({ location, data }) => ({
              location,
              data: data.timeseriesSummary,
            }))}
            height={300}
            toolbarChildren={deepFocusButtons?.wasteWater}
          />
        </GridCell>
      );
    } else {
      wasteWaterSummaryPlot = (
        <GridCell minWidth={600}>
          <NamedCard title='Wastewater prevalence' toolbar={deepFocusButtons?.wasteWater}>
            <div style={{ height: 300, width: '100%' }}>
              <Loader />
            </div>
          </NamedCard>
        </GridCell>
      );
    }
  }

  // Everything else

  return (
    <>
      <VariantHeader
        variant={ldvsSelector.variant}
        controls={<FocusVariantHeaderControls selector={ldvsSelector} />}
      />
      {variantDateCount.data &&
      wholeDateCountWithDateFilter.data &&
      variantAgeCount.data &&
      wholeAgeCount.data &&
      variantDivisionCount.data &&
      wholeDivisionCount.data &&
      variantInternationalDateCount.data &&
      wholeInternationalDateCount.data &&
      variantHospDeathAgeCount.data &&
      wholeHospDeathAgeCount.data ? (
        <>
          <div>
            <CoreMetrics
              variantSampleSet={variantDateCount.data}
              wholeSampleSet={wholeDateCountWithDateFilter.data}
            />
            {!isDefaultHostSelector(host) && (
              <div className='mx-0.5 mt-1 mb-5 md:mx-3 shadow-lg rounded-lg bg-white p-2 pl-4'>
                <VariantHosts selector={ldvsSelector} />
              </div>
            )}
            <NamedCard
              title='Lineages'
              tabs={{
                labels: ['Pango lineage (pangolin)', 'Pango lineage (Nextclade)', 'Nextstrain clade'],
                activeTabIndex: lineageDistributionIndex,
                onNewTabSelect: newIndex => setLineageDistributionIndex(newIndex),
              }}
            >
              <VariantLineages
                onVariantSelect={setVariants ?? (() => {})}
                selector={ldvsSelector}
                type={
                  (['pangoLineage', 'nextcladePangoLineage', 'nextstrainClade'] as const)[
                    lineageDistributionIndex
                  ]
                }
                key={lineageDistributionIndex}
              />
            </NamedCard>
            <PackedGrid maxColumns={2}>
              <GridCell minWidth={600}>
                {
                  <VariantTimeDistributionChartWidget.ShareableComponent
                    title='Sequences over time'
                    height={350}
                    variantSampleSet={variantDateCount.data}
                    wholeSampleSet={wholeDateCountWithDateFilter.data}
                    toolbarChildren={[
                      createDivisionBreakdownButton(
                        'SequencesOverTime',
                        setShowVariantTimeDistributionDivGrid
                      ),
                    ]}
                  />
                }
              </GridCell>
              {isDefaultHostSelector(host) && (
                <GridCell minWidth={600}>
                  <EstimatedCasesChartWidget.ShareableComponent
                    caseCounts={caseCountDataset}
                    variantDateCounts={variantDateCount.data}
                    wholeDateCounts={wholeDateCountWithDateFilter.data}
                    height={300}
                    title='Estimated cases'
                    toolbarChildren={
                      !country || (SWISS_SPECIALTIES_ACTIVATED && country === 'Switzerland')
                        ? [createDivisionBreakdownButton('EstimatedCases', setShowEstimatedCasesDivGrid)]
                        : []
                    }
                  />
                </GridCell>
              )}
              <GridCell minWidth={600}>
                <VariantInternationalComparisonChartWidget.ShareableComponent
                  preSelectedCountries={country ? [country] : []}
                  height={300}
                  title='International comparison'
                  toolbarChildren={deepFocusButtons?.internationalComparison}
                  variantInternationalSampleSet={variantInternationalDateCount.data}
                  wholeInternationalSampleSet={wholeInternationalDateCount.data}
                  logScale={false}
                />
              </GridCell>
              <GridCell minWidth={600}>
                <VariantDivisionDistributionChartWidget.ShareableComponent
                  title='Geographic distribution'
                  variantSampleSet={variantDivisionCount.data}
                  wholeSampleSet={wholeDivisionCount.data}
                />
              </GridCell>
              <GridCell minWidth={600}>
                <NamedCard
                  title='Relative growth advantage'
                  toolbar={
                    [
                      deepFocusButtons?.chen2021Fitness,
                      createDivisionBreakdownButton('Chen2021Fitness', setShowChen2021FitnessDivGrid),
                    ].filter(x => !!x) as JSX.Element[]
                  }
                >
                  <Chen2021FitnessExplanation />
                  <div style={{ height: window.innerWidth < 640 ? 600 : 400 }}>
                    <Chen2021FitnessPreview
                      variantDateCounts={variantDateCount.data}
                      wholeDateCounts={wholeDateCountWithDateFilter.data}
                    />
                  </div>
                </NamedCard>
              </GridCell>
              <GridCell minWidth={700}>
                <Althaus2021GrowthWidget.ShareableComponent
                  title='Relative growth advantage: three mechanisms'
                  variantDateCounts={variantDateCount.data}
                  wholeDateCounts={wholeDateCountWithDateFilter.data}
                />
              </GridCell>
              <GridCell minWidth={600}>
                <NamedCard title='Reproduction number'>
                  <HuismanScire2021ReContainer
                    wholeDateCounts={wholeDateCountWithDateFilter.data}
                    variantDateCounts={variantDateCount.data}
                    caseCounts={caseCountDataset}
                  />
                </NamedCard>
              </GridCell>
              {isDefaultHostSelector(host) && (
                <GridCell minWidth={600}>
                  <VariantAgeDistributionChartWidget.ShareableComponent
                    title='Age demographics'
                    height={300}
                    variantSampleSet={variantAgeCount.data}
                    wholeSampleSet={wholeAgeCount.data}
                    toolbarChildren={[
                      createDivisionBreakdownButton('AgeDemographics', setShowVariantAgeDistributionDivGrid),
                    ]}
                  />
                </GridCell>
              )}
              {SWISS_SPECIALTIES_ACTIVATED && country === 'Switzerland' && isDefaultHostSelector(host) && (
                <GridCell minWidth={600}>
                  <HospitalizationDeathChartWidget.ShareableComponent
                    extendedMetrics={false}
                    relativeToOtherVariants={false}
                    field='hospitalized'
                    variantSampleSet={variantHospDeathAgeCount.data}
                    wholeSampleSet={wholeHospDeathAgeCount.data}
                    variantName={ldvsSelector.variant.pangoLineage ?? 'unnamed variant'}
                    title='Hospitalization probabilities'
                    height={300}
                    toolbarChildren={deepFocusButtons?.hospitalizationAndDeath}
                  />
                </GridCell>
              )}
              {isDefaultHostSelector(host) && wasteWaterSummaryPlot}
            </PackedGrid>

            <div className='m-4'>
              <VariantMutationsTimelines selector={ldvsSelector} />
            </div>

            <div className='m-4'>
              <NucleotideEntropy selector={ldvsSelector} />
            </div>

            <div className='m-4'>
              <Sentry.ErrorBoundary fallback={<ErrorBoundaryFallback />}>
                <VariantInsertions selector={ldvsSelector} />
              </Sentry.ErrorBoundary>
            </div>

            <div className='m-4' id={MUTATIONS_HASH_LINK}>
              <Sentry.ErrorBoundary fallback={<ErrorBoundaryFallback />}>
                {/* HACK(by Chaoran): This is to add an "Export" button without actually implementing a Widget. */}
                <WidgetWrapper getShareUrl={async () => ''} title='Substitutions and deletions'>
                  <VariantMutations selector={ldvsSelector} />
                </WidgetWrapper>
              </Sentry.ErrorBoundary>
            </div>
          </div>

          {/* The division breakdown plots */}
          {showVariantTimeDistributionDivGrid && (
            <DivisionModal
              getData={splitSequencesOverTime.getData}
              splitData={splitSequencesOverTime.splitData}
              generate={(division, d) => (
                <VariantTimeDistributionChartWidget.ShareableComponent
                  variantSampleSet={d.variant}
                  wholeSampleSet={d.whole}
                  height={350}
                  title={division}
                />
              )}
              show={showVariantTimeDistributionDivGrid}
              handleClose={() => setShowVariantTimeDistributionDivGrid(false)}
              header='Sequences over time'
            />
          )}
          {showEstimatedCasesDivGrid && (splitField === 'country' || country === 'Switzerland') && (
            <DivisionModal
              getData={splitSequencesOverTime.getData}
              splitData={splitSequencesOverTime.splitData}
              generate={(division, d) =>
                d.cases ? (
                  <EstimatedCasesChartWidget.ShareableComponent
                    caseCounts={{
                      selector: d.cases.selector,
                      payload: d.cases.payload,
                      status: 'fulfilled',
                    }}
                    wholeDateCounts={d.whole}
                    variantDateCounts={d.variant}
                    title={division}
                    height={300}
                  />
                ) : (
                  <></>
                )
              }
              show={showEstimatedCasesDivGrid}
              handleClose={() => setShowEstimatedCasesDivGrid(false)}
              header='Estimated cases'
            />
          )}
          {showVariantAgeDistributionDivGrid && (
            <DivisionModal
              getData={splitAgeDistribution.getData}
              splitData={splitAgeDistribution.splitData}
              generate={(division, d) => (
                <VariantAgeDistributionChartWidget.ShareableComponent
                  variantSampleSet={d.variant}
                  wholeSampleSet={d.whole}
                  height={300}
                  title={division}
                />
              )}
              show={showVariantAgeDistributionDivGrid}
              handleClose={() => setShowVariantAgeDistributionDivGrid(false)}
              header='Age demographics'
            />
          )}
          {showChen2021FitnessDivGrid && (
            <DivisionModal
              getData={splitSequencesOverTime.getData}
              splitData={splitSequencesOverTime.splitData}
              generate={(division, d) => (
                <NamedCard title={division} toolbar={deepFocusButtons?.chen2021Fitness}>
                  <Chen2021FitnessExplanation />
                  <div style={{ height: 350 }}>
                    <Chen2021FitnessPreview variantDateCounts={d.variant} wholeDateCounts={d.whole} />
                  </div>
                </NamedCard>
              )}
              show={showChen2021FitnessDivGrid}
              handleClose={() => setShowChen2021FitnessDivGrid(false)}
              header='Relative growth advantage'
            />
          )}
        </>
      ) : (
        <Loader />
      )}
    </>
  );
};
