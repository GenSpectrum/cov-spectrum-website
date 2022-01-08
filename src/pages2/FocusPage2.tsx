import { SplitExploreWrapper, SplitFocusWrapper, SplitParentWrapper } from '../helpers/app-layout';
import React, { useEffect, useMemo, useState } from 'react';
import { KnownVariantsList } from '../components/KnownVariantsList/KnownVariantsList';
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
import { Chen2021FitnessPreview } from '../models/chen2021Fitness/Chen2021FitnessPreview';
import { Althaus2021GrowthWidget } from '../models/althaus2021Growth/Althaus2021GrowthWidget';
import { VariantAgeDistributionChartWidget } from '../widgets/VariantAgeDistributionChartWidget';
import { AgeCountSampleData } from '../data/sample/AgeCountSampleDataset';
import { VariantMutations } from '../components/VariantMutations';
import { CaseCountAsyncDataset, CaseCountData } from '../data/CaseCountDataset';
import { useAsyncDataset } from '../helpers/use-async-dataset';
import { Button, ButtonVariant, ShowMoreButton } from '../helpers/ui';
import { mapValues } from 'lodash';
import { CountryDateCountSampleData } from '../data/sample/CountryDateCountSampleDataset';
import { InternalLink } from '../components/InternalLink';
import { DateRangePicker } from '../components/DateRangePicker';
import { VariantSearch } from '../components/VariantSearch';
import { VariantHeader } from '../components/VariantHeader';
import { FocusVariantHeaderControls } from '../components/FocusVariantHeaderControls';
import { DivisionModal } from '../components/DivisionModal';
import { _fetchAggSamples } from '../data/api-lapis';
import { FullSampleAggEntry, FullSampleAggEntryField } from '../data/sample/FullSampleAggEntry';
import { Utils } from '../services/Utils';
import { useDeepCompareMemo } from '../helpers/deep-compare-hooks';
import { WasteWaterDataset } from '../models/wasteWater/types';
import { filter, getData } from '../models/wasteWater/loading';
import { WASTE_WATER_AVAILABLE_LINEAGES } from '../models/wasteWater/WasteWaterDeepFocus';
import { WasteWaterSummaryTimeWidget } from '../models/wasteWater/WasteWaterSummaryTimeWidget';
import { ArticleData } from '../data/ArticleDataset';
import { ArticleListWidget } from '../widgets/ArticleListWidget';
import { HospDiedAgeSampleData } from '../data/sample/HospDiedAgeSampleDataset';
import { HospitalizationDeathChartWidget } from '../widgets/HospitalizationDeathChartWidget';

type Props = {
  isSmallScreen: boolean;
};

export const FocusPage2 = ({ isSmallScreen }: Props) => {
  const exploreUrl = useExploreUrl();
  const [showVariantTimeDistributionDivGrid, setShowVariantTimeDistributionDivGrid] = useState(false);
  const [showEstimatedCasesDivGrid, setShowEstimatedCasesDivGrid] = useState(false);
  const [showVariantAgeDistributionDivGrid, setShowVariantAgeDistributionDivGrid] = useState(false);
  const [showChen2021FitnessDivGrid, setShowChen2021FitnessDivGrid] = useState(false);

  // Deep focus buttons
  const deepFocusButtons = useMemo(
    () =>
      mapValues(deepFocusPaths, suffix => {
        return <ShowMoreButton key={suffix} to={exploreUrl?.getDeepFocusPageUrl(suffix) ?? '#'} />;
      }),
    [exploreUrl]
  );

  // --- Fetch data ---
  const ldvsSelector = {
    location: exploreUrl?.location!,
    dateRange: exploreUrl?.dateRange,
    samplingStrategy: exploreUrl?.samplingStrategy!,
    variant: exploreUrl?.variant,
  };
  const ldsSelector = {
    location: exploreUrl?.location!,
    dateRange: exploreUrl?.dateRange,
    samplingStrategy: exploreUrl?.samplingStrategy!,
  };
  const lsSelector = {
    location: exploreUrl?.location!,
    samplingStrategy: exploreUrl?.samplingStrategy!,
  };
  const dvsSelector = {
    location: {},
    dateRange: exploreUrl?.dateRange,
    samplingStrategy: exploreUrl?.samplingStrategy!,
    variant: exploreUrl?.variant,
  };
  const dsSelector = {
    location: {},
    dateRange: exploreUrl?.dateRange,
    samplingStrategy: exploreUrl?.samplingStrategy!,
  };
  const lSelector = {
    location: exploreUrl?.location!,
  };
  // Date counts
  const variantDateCount = useQuery(signal => DateCountSampleData.fromApi(ldvsSelector, signal), [
    ldvsSelector,
  ]);
  const wholeDateCountWithDateFilter = useQuery(signal => DateCountSampleData.fromApi(ldsSelector, signal), [
    ldsSelector,
  ]);
  const wholeDateCountWithoutDateFilter = useQuery(
    signal => DateCountSampleData.fromApi(lsSelector, signal),
    [lsSelector]
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
  const variantAgeCount = useQuery(signal => AgeCountSampleData.fromApi(ldvsSelector, signal), [
    ldvsSelector,
  ]);
  const wholeAgeCount = useQuery(
    // Used by the focus page
    signal => AgeCountSampleData.fromApi(ldsSelector, signal),
    [ldsSelector]
  );
  // Division counts
  const variantDivisionCount = useQuery(signal => DivisionCountSampleData.fromApi(ldvsSelector, signal), [
    ldvsSelector,
  ]);
  const wholeDivisionCount = useQuery(signal => DivisionCountSampleData.fromApi(ldsSelector, signal), [
    ldsSelector,
  ]);

  // Hospitalization and death
  const variantHospDeathAgeCount = useQuery(signal => HospDiedAgeSampleData.fromApi(ldvsSelector, signal), [
    ldvsSelector,
  ]);
  const wholeHospDeathAgeCount = useQuery(signal => HospDiedAgeSampleData.fromApi(ldsSelector, signal), [
    ldsSelector,
  ]);

  // Cases
  const caseCountDataset: CaseCountAsyncDataset = useAsyncDataset(lSelector, ({ selector }, { signal }) =>
    CaseCountData.fromApi(selector, signal)
  );

  // Wastewater
  const [wasteWaterData, setWasteWaterData] = useState<WasteWaterDataset | undefined>(undefined);
  const pangoLineageWithoutAsterisk = exploreUrl?.variant?.pangoLineage?.replace('*', '');
  useEffect(() => {
    let isMounted = true;
    const country = exploreUrl?.location.country;
    if (!pangoLineageWithoutAsterisk || !country) {
      return;
    }
    getData({ country }).then(
      dataset => isMounted && dataset && setWasteWaterData(filter(dataset, pangoLineageWithoutAsterisk))
    );

    return () => {
      isMounted = false;
    };
  }, [exploreUrl?.location.country, pangoLineageWithoutAsterisk]);

  // Articles
  const articleDataset = useQuery(
    signal =>
      exploreUrl?.variant?.pangoLineage
        ? ArticleData.fromApi(exploreUrl?.variant?.pangoLineage, signal)
        : Promise.resolve(undefined),
    [exploreUrl?.variant?.pangoLineage]
  );

  // --- Prepare data for sub-division plots ---
  // If this is not a country page, the sub-plots will be split by countries. Otherwise, they should be split by
  // divisions.
  const splitField = !exploreUrl?.location.country ? 'country' : 'division';
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

  const splitSequencesOverTime = useDeepCompareMemo(() => generateSplitData(splitField, 'date'), [
    splitField,
    ldvsSelector,
    ldsSelector,
    [...(caseCountDatasetSplit?.keys() ?? [])],
  ]);
  const splitAgeDistribution = useDeepCompareMemo(() => generateSplitData(splitField, 'age'), [
    splitField,
    ldvsSelector,
    ldsSelector,
  ]);
  const splitChen2021Fitness = useDeepCompareMemo(() => {
    return {
      // Note: The typings are not entirely correct. The data entries only contain the splitField and count.
      getData: (signal: AbortSignal) => _fetchAggSamples(ldvsSelector, [splitField], signal),
      splitData: (data: FullSampleAggEntry[]) => {
        return [...Utils.groupBy(data, d => d[splitField]).entries()]
          .filter(([division]) => division)
          .sort((a, b) => a[0]!.localeCompare(b[0]!))
          .map(([division, _]) => ({ division: division!, data: null }));
      },
    };
  }, [ldvsSelector, splitField]);

  // --- Rendering ---

  if (!exploreUrl || !exploreUrl.variant) {
    return null;
  }
  const { pangoLineage } = exploreUrl.variant;
  const { country } = exploreUrl.location;

  // Wastewater plot
  let wasteWaterSummaryPlot = undefined;
  if (
    country === 'Switzerland' &&
    pangoLineageWithoutAsterisk &&
    WASTE_WATER_AVAILABLE_LINEAGES.includes(pangoLineageWithoutAsterisk)
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
            toolbarChildren={deepFocusButtons.wasteWater}
          />
        </GridCell>
      );
    } else {
      wasteWaterSummaryPlot = (
        <GridCell minWidth={600}>
          <NamedCard title='Wastewater prevalence' toolbar={deepFocusButtons.wasteWater}>
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
      <SplitParentWrapper>
        {/* Known variant selection */}
        <SplitExploreWrapper>
          {wholeDateCountWithoutDateFilter.data ? (
            <div id='explore-selectors'>
              <KnownVariantsList
                onVariantSelect={exploreUrl.setVariant}
                wholeDateCountSampleDataset={wholeDateCountWithoutDateFilter.data}
                variantSelector={exploreUrl.variant}
                isHorizontal={isSmallScreen}
                isLandingPage={false}
              />
            </div>
          ) : (
            <Loader />
          )}
        </SplitExploreWrapper>
        {/* Main content */}
        <SplitFocusWrapper>
          {!isSmallScreen && (
            <div className='text-sm mb-2'>
              <p>
                Search for pango lineages, amino acid mutations, and nucleotide mutations (
                <InternalLink path='/about#faq-search-variants'>see documentation</InternalLink>):
              </p>
            </div>
          )}
          <div id='variant-search-bar' className='flex flex-row flex-wrap m-1'>
            <div className='m-1'>
              <DateRangePicker dateRangeSelector={exploreUrl.dateRange} />
            </div>
            <div className='m-1 flex-grow'>
              <VariantSearch
                onVariantSelect={exploreUrl.setVariant}
                currentSelection={exploreUrl.variant}
                isSimple={isSmallScreen}
              />
            </div>
          </div>
          <VariantHeader
            dateRange={exploreUrl.dateRange}
            variant={exploreUrl.variant}
            controls={
              <FocusVariantHeaderControls
                selector={{
                  location: exploreUrl.location,
                  dateRange: exploreUrl.dateRange,
                  variant: exploreUrl.variant,
                  samplingStrategy: exploreUrl.samplingStrategy,
                }}
              />
            }
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
                {(!pangoLineage || pangoLineage.endsWith('*')) && (
                  <div className='mx-0.5 mt-1 mb-5 md:mx-3 shadow-lg rounded-lg bg-white p-2 pl-4'>
                    <VariantLineages
                      onVariantSelect={exploreUrl.setVariant}
                      selector={variantDateCount.data.selector}
                    />{' '}
                  </div>
                )}
                <PackedGrid maxColumns={2}>
                  <GridCell minWidth={600}>
                    {
                      <VariantTimeDistributionChartWidget.ShareableComponent
                        title='Sequences over time'
                        height={300}
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
                  <GridCell minWidth={600}>
                    <EstimatedCasesChartWidget.ShareableComponent
                      caseCounts={caseCountDataset}
                      variantDateCounts={variantDateCount.data}
                      wholeDateCounts={wholeDateCountWithDateFilter.data}
                      height={300}
                      title='Estimated cases'
                      toolbarChildren={
                        !country || country === 'Switzerland'
                          ? [createDivisionBreakdownButton('EstimatedCases', setShowEstimatedCasesDivGrid)]
                          : []
                      }
                    />
                  </GridCell>
                  <GridCell minWidth={600}>
                    <VariantInternationalComparisonChartWidget.ShareableComponent
                      preSelectedCountries={country ? [country] : []}
                      height={300}
                      title='International comparison'
                      toolbarChildren={deepFocusButtons.internationalComparison}
                      variantInternationalSampleSet={variantInternationalDateCount.data}
                      wholeInternationalSampleSet={wholeInternationalDateCount.data}
                      logScale={false}
                    />
                  </GridCell>
                  <GridCell minWidth={600}>
                    {
                      <VariantDivisionDistributionChartWidget.ShareableComponent
                        title='Geographic distribution'
                        variantSampleSet={variantDivisionCount.data}
                        wholeSampleSet={wholeDivisionCount.data}
                      />
                    }
                  </GridCell>
                  <GridCell minWidth={600}>
                    <NamedCard
                      title='Relative growth advantage'
                      toolbar={[
                        deepFocusButtons.chen2021Fitness,
                        createDivisionBreakdownButton('Chen2021Fitness', setShowChen2021FitnessDivGrid),
                      ]}
                      description={`
             If variants spread pre-dominantly by local transmission across demographic groups, this estimate reflects 
             the relative growth advantage of the focal variant. Importantly, the relative growth advantage estimate 
             reflects the advantage compared to co-circulating strains. Thus, as new variants spread, the advantage of 
             the focal variant may decrease. Many factors can contribute to a growth advantage, including an intrinsic 
             transmission advantage and immune evasion. When absolute numbers of a variant are low, the advantage may 
             merely reflect the current importance of introductions from abroad or the variant spreading in a particular
              demographic group. In this case, the estimate does not provide information on any intrinsic fitness 
              advantages.`}
                    >
                      <div style={{ height: 400 }}>
                        <Chen2021FitnessPreview
                          locationSelector={variantDateCount.data.selector.location}
                          dateRangeSelector={variantDateCount.data.selector.dateRange!}
                          variantSelector={variantDateCount.data.selector.variant!}
                          samplingStrategy={variantDateCount.data.selector.samplingStrategy}
                        />
                      </div>
                    </NamedCard>
                  </GridCell>
                  <GridCell minWidth={700}>
                    <Althaus2021GrowthWidget.ShareableComponent
                      title='Relative growth advantage'
                      locationSelector={variantDateCount.data.selector.location}
                      dateRangeSelector={variantDateCount.data.selector.dateRange!}
                      variantSelector={variantDateCount.data.selector.variant!}
                      samplingStrategy={variantDateCount.data.selector.samplingStrategy}
                    />
                  </GridCell>
                  <GridCell minWidth={600}>
                    <VariantAgeDistributionChartWidget.ShareableComponent
                      title='Age demographics'
                      height={300}
                      variantSampleSet={variantAgeCount.data}
                      wholeSampleSet={wholeAgeCount.data}
                      toolbarChildren={[
                        createDivisionBreakdownButton(
                          'AgeDemographics',
                          setShowVariantAgeDistributionDivGrid
                        ),
                      ]}
                    />
                  </GridCell>
                  {country === 'Switzerland' && (
                    <GridCell minWidth={600}>
                      <HospitalizationDeathChartWidget.ShareableComponent
                        extendedMetrics={false}
                        relativeToOtherVariants={false}
                        field='hospitalized'
                        variantSampleSet={variantHospDeathAgeCount.data}
                        wholeSampleSet={wholeHospDeathAgeCount.data}
                        variantName={exploreUrl.variant.pangoLineage ?? 'unnamed variant'}
                        title='Hospitalization probabilities'
                        height={300}
                        toolbarChildren={deepFocusButtons.hospitalizationAndDeath}
                      />
                    </GridCell>
                  )}
                  {wasteWaterSummaryPlot}
                  {exploreUrl?.variant?.pangoLineage && ( // TODO Check that nothing else is set
                    <GridCell minWidth={800}>
                      {articleDataset && articleDataset.isSuccess ? (
                        <ArticleListWidget.ShareableComponent
                          title='Publications and pre-Prints'
                          articleDataset={articleDataset.data!}
                        />
                      ) : (
                        <Loader />
                      )}
                    </GridCell>
                  )}
                </PackedGrid>

                <div className='m-4'>
                  <VariantMutations selector={variantDateCount.data.selector} />
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
                      height={300}
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
                  getData={splitChen2021Fitness.getData}
                  splitData={splitChen2021Fitness.splitData}
                  generate={(division, _) => (
                    <NamedCard
                      title={division}
                      toolbar={deepFocusButtons.chen2021Fitness}
                      description={`
              If variants spread pre-dominantly by local transmission across demographic groups, this estimate reflects 
              the relative growth advantage of the focal variant. Importantly, the relative growth advantage estimate 
              reflects the advantage compared to co-circulating strains. Thus, as new variants spread, the advantage of 
              the focal variant may decrease. Many factors can contribute to a growth advantage, including an intrinsic 
              transmission advantage and immune evasion. When absolute numbers of a variant are low, the advantage may 
              merely reflect the current importance of introductions from abroad or the variant spreading in a particular
               demographic group. In this case, the estimate does not provide information on any intrinsic fitness 
               advantages.`}
                    >
                      <div style={{ height: 350 }}>
                        <Chen2021FitnessPreview
                          locationSelector={{
                            ...exploreUrl?.location!,
                            [splitField]: division,
                          }}
                          dateRangeSelector={exploreUrl?.dateRange!}
                          variantSelector={exploreUrl?.variant!}
                          samplingStrategy={exploreUrl?.samplingStrategy}
                        />
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
        </SplitFocusWrapper>
      </SplitParentWrapper>
    </>
  );
};

const createDivisionBreakdownButton = (key: string, setter: (show: boolean) => void) => (
  <Button
    key={key}
    className='mt-1 ml-2'
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
