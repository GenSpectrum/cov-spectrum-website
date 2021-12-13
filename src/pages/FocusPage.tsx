import { mapValues } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import Loader from '../components/Loader';
import { NamedCard } from '../components/NamedCard';
import { GridCell, PackedGrid } from '../components/PackedGrid';
import { VariantLineages } from '../components/VariantLineages';
import { VariantMutations } from '../components/VariantMutations';
import { Button, ButtonVariant, ShowMoreButton } from '../helpers/ui';
import { filter, getData } from '../models/wasteWater/loading';
import { WasteWaterDataset } from '../models/wasteWater/types';
import { WASTE_WATER_AVAILABLE_LINEAGES } from '../models/wasteWater/WasteWaterDeepFocus';
import { WasteWaterSummaryTimeWidget } from '../models/wasteWater/WasteWaterSummaryTimeWidget';
import { ArticleListWidget } from '../widgets/ArticleListWidget';
import { DateCountSampleData } from '../data/sample/DateCountSampleDataset';
import { VariantTimeDistributionChartWidget } from '../widgets/VariantTimeDistributionChartWidget';
import { DetailedSampleAggData, DetailedSampleAggDataset } from '../data/sample/DetailedSampleAggDataset';
import { AgeCountSampleData } from '../data/sample/AgeCountSampleDataset';
import { VariantAgeDistributionChartWidget } from '../widgets/VariantAgeDistributionChartWidget';
import { VariantDivisionDistributionChartWidget } from '../widgets/VariantDivisionDistributionChartWidget';
import { DivisionCountSampleData } from '../data/sample/DivisionCountSampleDataset';
import { DivisionModal } from '../components/DivisionModal';
import { HospitalizationDeathChartWidget } from '../widgets/HospitalizationDeathChartWidget';
import { CaseCountAsyncDataset, CaseCountData, CaseCountDataset } from '../data/CaseCountDataset';
import { EstimatedCasesChartWidget } from '../widgets/EstimatedCasesChartWidget';
import { VariantInternationalComparisonChartWidget } from '../widgets/VariantInternationalComparisonChartWidget';
import { CountryDateCountSampleDataset } from '../data/sample/CountryDateCountSampleDataset';
import { ArticleData } from '../data/ArticleDataset';
import { VariantSelector } from '../data/VariantSelector';
import { Chen2021FitnessPreview } from '../models/chen2021Fitness/Chen2021FitnessPreview';
import { useExploreUrl } from '../helpers/explore-url';
import { useQuery } from '../helpers/query-hook';
import { CoreMetrics } from '../components/CoreMetrics';
import { Althaus2021GrowthWidget } from '../models/althaus2021Growth/Althaus2021GrowthWidget';

interface Props {
  variantDataset: DetailedSampleAggDataset;
  wholeDataset: DetailedSampleAggDataset;
  caseCountDataset: CaseCountAsyncDataset;
  variantInternationalDateCountDataset: CountryDateCountSampleDataset;
  wholeInternationalDateCountDataset: CountryDateCountSampleDataset;
  onVariantSelect: (selection: VariantSelector) => void;
}

const deepFocusPaths = {
  internationalComparison: '/international-comparison',
  chen2021Fitness: '/chen-2021-fitness',
  hospitalizationAndDeath: '/hospitalization-death',
  wasteWater: '/waste-water',
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

export const FocusPage = ({
  variantDataset,
  wholeDataset,
  caseCountDataset,
  variantInternationalDateCountDataset,
  wholeInternationalDateCountDataset,
  onVariantSelect,
}: Props) => {
  const [showVariantTimeDistributionDivGrid, setShowVariantTimeDistributionDivGrid] = useState(false);
  const [showEstimatedCasesDivGrid, setShowEstimatedCasesDivGrid] = useState(false);
  const [showVariantAgeDistributionDivGrid, setShowVariantAgeDistributionDivGrid] = useState(false);
  const [showChen2021FitnessDivGrid, setShowChen2021FitnessDivGrid] = useState(false);

  const pangoLineageQuery = variantDataset.selector.variant?.pangoLineage;
  const articleDataset = useQuery(
    signal =>
      pangoLineageQuery ? ArticleData.fromApi(pangoLineageQuery, signal) : Promise.resolve(undefined),
    [pangoLineageQuery]
  );

  const divisionSubData = useMemo(() => {
    if (!variantDataset || !wholeDataset || !caseCountDataset.payload) {
      return undefined;
    }
    const variantDatasetSplit = DetailedSampleAggData.split(
      variantDataset,
      e => e.division ?? 'Unknown',
      (oldSelector, entry) => ({
        ...oldSelector,
        location: {
          ...oldSelector.location,
          division: entry.division ?? undefined,
        },
      })
    );
    const wholeDatasetSplit = DetailedSampleAggData.split(
      wholeDataset,
      e => e.division ?? 'Unknown',
      (oldSelector, entry) => ({
        ...oldSelector,
        location: {
          ...oldSelector.location,
          division: entry.division ?? undefined,
        },
      })
    );
    const caseCountDatasetSplit = CaseCountData.split(
      { selector: caseCountDataset.selector, payload: caseCountDataset.payload },
      e => e.division ?? 'Unknown',
      (oldSelector, entry) => ({
        ...oldSelector,
        location: {
          ...oldSelector.location,
          division: entry.division ?? undefined,
        },
      })
    );
    const merged = new Map<
      string,
      {
        variant: DetailedSampleAggDataset;
        whole: DetailedSampleAggDataset;
        cases: CaseCountDataset | undefined;
      }
    >();
    for (let [division, whole] of wholeDatasetSplit) {
      const variant = variantDatasetSplit.get(division);
      if (!variant) {
        continue;
      }
      const cases = caseCountDatasetSplit.get(division);
      merged.set(division, { variant, whole, cases });
    }
    return merged;
  }, [variantDataset, wholeDataset, caseCountDataset.payload, caseCountDataset.selector]);

  const countrySubData = useMemo(() => {
    if (!variantDataset || !wholeDataset || !caseCountDataset.payload) {
      return undefined;
    }
    const variantDatasetSplit = DetailedSampleAggData.split(
      variantDataset,
      e => e.country ?? 'Unknown',
      (oldSelector, entry) => ({
        ...oldSelector,
        location: {
          ...oldSelector.location,
          country: entry.country ?? undefined,
        },
      })
    );
    const wholeDatasetSplit = DetailedSampleAggData.split(
      wholeDataset,
      e => e.country ?? 'Unknown',
      (oldSelector, entry) => ({
        ...oldSelector,
        location: {
          ...oldSelector.location,
          country: entry.country ?? undefined,
        },
      })
    );
    const caseCountDatasetSplit = CaseCountData.split(
      { selector: caseCountDataset.selector, payload: caseCountDataset.payload },
      e => e.country ?? 'Unknown',
      (oldSelector, entry) => ({
        ...oldSelector,
        location: {
          ...oldSelector.location,
          country: entry.country ?? undefined,
        },
      })
    );
    const merged = new Map<
      string,
      {
        variant: DetailedSampleAggDataset;
        whole: DetailedSampleAggDataset;
        cases: CaseCountDataset | undefined;
      }
    >();
    for (let [country, whole] of wholeDatasetSplit) {
      const variant = variantDatasetSplit.get(country);
      if (!variant) {
        continue;
      }
      const cases = caseCountDatasetSplit.get(country);
      merged.set(country, { variant, whole, cases });
    }
    return merged;
  }, [variantDataset, wholeDataset, caseCountDataset.payload, caseCountDataset.selector]);

  const exploreUrl = useExploreUrl();
  const deepFocusButtons = useMemo(
    () =>
      mapValues(deepFocusPaths, suffix => {
        return <ShowMoreButton key={suffix} to={exploreUrl?.getDeepFocusPageUrl(suffix) ?? '#'} />;
      }),
    [exploreUrl]
  );

  const country = variantDataset.selector.location.country;
  const pangoLineage = variantDataset.selector.variant?.pangoLineage;
  const [wasteWaterData, setWasteWaterData] = useState<WasteWaterDataset | undefined>(undefined);
  useEffect(() => {
    let isMounted = true;
    if (!pangoLineage || !country) {
      return;
    }
    getData({ country }).then(
      dataset => isMounted && dataset && setWasteWaterData(filter(dataset, pangoLineage))
    );

    return () => {
      isMounted = false;
    };
  }, [country, pangoLineage]);

  let wasteWaterSummaryPlot = undefined;
  if (country === 'Switzerland' && pangoLineage && WASTE_WATER_AVAILABLE_LINEAGES.includes(pangoLineage)) {
    if (wasteWaterData) {
      wasteWaterSummaryPlot = (
        <GridCell minWidth={600}>
          <WasteWaterSummaryTimeWidget.ShareableComponent
            country={country}
            title='Wastewater prevalence'
            variantName={pangoLineage}
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

  if (!variantDataset.selector.variant) {
    return <></>;
  }

  const subData = variantDataset.selector.location.country ? divisionSubData : countrySubData;

  return (
    <>
      <div>
        <CoreMetrics
          variantSampleSet={DateCountSampleData.fromDetailedSampleAggDataset(variantDataset)}
          wholeSampleSet={DateCountSampleData.fromDetailedSampleAggDataset(wholeDataset)}
        />
        {(!pangoLineage || pangoLineage.endsWith('*')) && (
          <div className='mx-0.5 mt-1 mb-5 md:mx-3 shadow-lg rounded-lg bg-white p-2 pl-4'>
            <VariantLineages onVariantSelect={onVariantSelect} selector={variantDataset.selector} />{' '}
          </div>
        )}
        <PackedGrid maxColumns={2}>
          <GridCell minWidth={600}>
            {
              <VariantTimeDistributionChartWidget.ShareableComponent
                title='Sequences over time'
                height={300}
                variantSampleSet={DateCountSampleData.fromDetailedSampleAggDataset(variantDataset)}
                wholeSampleSet={DateCountSampleData.fromDetailedSampleAggDataset(wholeDataset)}
                toolbarChildren={[
                  createDivisionBreakdownButton('SequencesOverTime', setShowVariantTimeDistributionDivGrid),
                ]}
              />
            }
          </GridCell>
          <GridCell minWidth={600}>
            <EstimatedCasesChartWidget.ShareableComponent
              caseCounts={caseCountDataset}
              variantDateCounts={DateCountSampleData.fromDetailedSampleAggDataset(variantDataset)}
              wholeDateCounts={DateCountSampleData.fromDetailedSampleAggDataset(wholeDataset)}
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
              variantInternationalSampleSet={variantInternationalDateCountDataset}
              wholeInternationalSampleSet={wholeInternationalDateCountDataset}
              logScale={false}
            />
          </GridCell>
          <GridCell minWidth={600}>
            {
              <VariantDivisionDistributionChartWidget.ShareableComponent
                title='Geographic distribution'
                variantSampleSet={DivisionCountSampleData.fromDetailedSampleAggDataset(variantDataset)}
                wholeSampleSet={DivisionCountSampleData.fromDetailedSampleAggDataset(wholeDataset)}
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
              <div style={{ height: 300 }}>
                <Chen2021FitnessPreview
                  locationSelector={variantDataset.selector.location}
                  dateRangeSelector={variantDataset.selector.dateRange!}
                  variantSelector={variantDataset.selector.variant!}
                  samplingStrategy={variantDataset.selector.samplingStrategy}
                />
              </div>
            </NamedCard>
          </GridCell>
          <GridCell minWidth={700}>
            <Althaus2021GrowthWidget.ShareableComponent
              title='Relative growth advantage'
              locationSelector={variantDataset.selector.location}
              dateRangeSelector={variantDataset.selector.dateRange!}
              variantSelector={variantDataset.selector.variant!}
              samplingStrategy={variantDataset.selector.samplingStrategy}
            />
          </GridCell>
          <GridCell minWidth={600}>
            {
              <VariantAgeDistributionChartWidget.ShareableComponent
                title='Age demographics'
                height={300}
                variantSampleSet={AgeCountSampleData.fromDetailedSampleAggDataset(variantDataset)}
                wholeSampleSet={AgeCountSampleData.fromDetailedSampleAggDataset(wholeDataset)}
                toolbarChildren={[
                  createDivisionBreakdownButton('AgeDemographics', setShowVariantAgeDistributionDivGrid),
                ]}
              />
            }
          </GridCell>
          {country === 'Switzerland' && (
            <GridCell minWidth={600}>
              <HospitalizationDeathChartWidget.ShareableComponent
                extendedMetrics={false}
                relativeToOtherVariants={false}
                field='hospitalized'
                variantSampleSet={variantDataset}
                wholeSampleSet={wholeDataset}
                variantName={variantDataset.selector.variant?.pangoLineage ?? 'unnamed variant'}
                title='Hospitalization probabilities'
                height={300}
                toolbarChildren={deepFocusButtons.hospitalizationAndDeath}
              />
            </GridCell>
          )}
          {wasteWaterSummaryPlot}
          {pangoLineageQuery && ( // TODO Check that nothing else is set
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
          <VariantMutations selector={variantDataset.selector} />
        </div>
      </div>

      {/* The division breakdown plots */}
      {showVariantTimeDistributionDivGrid && subData && (
        <DivisionModal
          data={subData}
          generate={(division, d) => (
            <VariantTimeDistributionChartWidget.ShareableComponent
              variantSampleSet={DateCountSampleData.fromDetailedSampleAggDataset(d.variant)}
              wholeSampleSet={DateCountSampleData.fromDetailedSampleAggDataset(d.whole)}
              height={300}
              title={division}
            />
          )}
          show={showVariantTimeDistributionDivGrid}
          handleClose={() => setShowVariantTimeDistributionDivGrid(false)}
          header='Sequences over time'
        />
      )}
      {showEstimatedCasesDivGrid && subData && (!country || country === 'Switzerland') && (
        <DivisionModal
          data={subData}
          generate={(division, d) =>
            d.cases ? (
              <EstimatedCasesChartWidget.ShareableComponent
                caseCounts={{
                  selector: d.cases.selector,
                  payload: d.cases.payload,
                  status: 'fulfilled',
                }}
                wholeDateCounts={DateCountSampleData.fromDetailedSampleAggDataset(d.whole)}
                variantDateCounts={DateCountSampleData.fromDetailedSampleAggDataset(d.variant)}
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
      {showVariantAgeDistributionDivGrid && subData && (
        <DivisionModal
          data={subData}
          generate={(division, d) => (
            <VariantAgeDistributionChartWidget.ShareableComponent
              variantSampleSet={AgeCountSampleData.fromDetailedSampleAggDataset(d.variant)}
              wholeSampleSet={AgeCountSampleData.fromDetailedSampleAggDataset(d.whole)}
              height={300}
              title={division}
            />
          )}
          show={showVariantAgeDistributionDivGrid}
          handleClose={() => setShowVariantAgeDistributionDivGrid(false)}
          header='Age demographics'
        />
      )}
      {showChen2021FitnessDivGrid && subData && (
        <DivisionModal
          data={subData}
          generate={(division, d) => (
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
              <div style={{ height: 300 }}>
                <Chen2021FitnessPreview
                  locationSelector={d.variant.selector.location}
                  dateRangeSelector={variantDataset.selector.dateRange!}
                  variantSelector={variantDataset.selector.variant!}
                  samplingStrategy={variantDataset.selector.samplingStrategy}
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
  );
};
