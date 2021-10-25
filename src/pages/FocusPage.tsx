import { mapValues } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { FocusVariantHeaderControls } from '../components/FocusVariantHeaderControls';
import Loader from '../components/Loader';
import { NamedCard } from '../components/NamedCard';
import { GridCell, PackedGrid } from '../components/PackedGrid';
import { VariantHeader } from '../components/VariantHeader';
import { VariantLineages } from '../components/VariantLineages';
import { VariantMutations } from '../components/VariantMutations';
import { Button, ButtonVariant, ShowMoreButton } from '../helpers/ui';
import { filter, getData } from '../models/wasteWater/loading';
import { WasteWaterDataset } from '../models/wasteWater/types';
import { WASTE_WATER_AVAILABLE_LINEAGES } from '../models/wasteWater/WasteWaterDeepFocus';
import { WasteWaterSummaryTimeWidget } from '../models/wasteWater/WasteWaterSummaryTimeWidget';
import { ArticleListWidget } from '../widgets/ArticleListWidget';
import { DateCountSampleDataset } from '../data/sample/DateCountSampleDataset';
import { VariantTimeDistributionChartWidget } from '../widgets/VariantTimeDistributionChartWidget';
import { DetailedSampleAggDataset } from '../data/sample/DetailedSampleAggDataset';
import { AgeCountSampleDataset } from '../data/sample/AgeCountSampleDataset';
import { VariantAgeDistributionChartWidget } from '../widgets/VariantAgeDistributionChartWidget';
import { VariantDivisionDistributionChartWidget } from '../widgets/VariantDivisionDistributionChartWidget';
import { DivisionCountSampleDataset } from '../data/sample/DivisionCountSampleDataset';
import { DivisionModal } from '../components/DivisionModal';
import { HospitalizationDeathChartWidget } from '../widgets/HospitalizationDeathChartWidget';
import { CaseCountDataset } from '../data/CaseCountDataset';
import { EstimatedCasesChartWidget } from '../widgets/EstimatedCasesChartWidget';
import { VariantInternationalComparisonChartWidget } from '../widgets/VariantInternationalComparisonChartWidget';
import { CountryDateCountSampleDataset } from '../data/sample/CountryDateCountSampleDataset';
import { ArticleDataset } from '../data/ArticleDataset';
import { VariantSelector } from '../data/VariantSelector';
import { Chen2021FitnessPreview } from '../models/chen2021Fitness/Chen2021FitnessPreview';
import { useExploreUrl } from '../helpers/explore-url';
import { useQuery } from '../helpers/query-hook';

interface Props {
  variantDataset: DetailedSampleAggDataset;
  wholeDataset: DetailedSampleAggDataset;
  caseCountDataset: CaseCountDataset;
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

const createDivisionBreakdownButton = (setter: (show: boolean) => void) => (
  <Button
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

  const pangoLineageQuery = variantDataset.getSelector().variant?.pangoLineage;
  const articleDataset = useQuery(
    signal =>
      pangoLineageQuery ? ArticleDataset.fromApi(pangoLineageQuery, signal) : Promise.resolve(undefined),
    [pangoLineageQuery]
  );

  const divisionSubData = useMemo(() => {
    if (!variantDataset || !wholeDataset) {
      return undefined;
    }
    const variantDatasetSplit = DetailedSampleAggDataset.split(
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
    const wholeDatasetSplit = DetailedSampleAggDataset.split(
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
    const caseCountDatasetSplit = CaseCountDataset.split(
      caseCountDataset,
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
  }, [variantDataset, wholeDataset, caseCountDataset]);

  const countrySubData = useMemo(() => {
    if (!variantDataset || !wholeDataset) {
      return undefined;
    }
    const variantDatasetSplit = DetailedSampleAggDataset.split(
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
    const wholeDatasetSplit = DetailedSampleAggDataset.split(
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
    const caseCountDatasetSplit = CaseCountDataset.split(
      caseCountDataset,
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
  }, [variantDataset, wholeDataset, caseCountDataset]);

  const exploreUrl = useExploreUrl();
  const deepFocusButtons = useMemo(
    () =>
      mapValues(deepFocusPaths, suffix => {
        return <ShowMoreButton to={exploreUrl?.getDeepFocusPageUrl(suffix) ?? '#'} />;
      }),
    [exploreUrl]
  );

  const country = variantDataset.getSelector().location.country;
  const pangoLineage = variantDataset.getSelector().variant?.pangoLineage;
  const [wasteWaterData, setWasteWaterData] = useState<WasteWaterDataset | undefined>(undefined);
  useEffect(() => {
    if (!pangoLineage || !country) {
      return;
    }
    getData({ country }).then(dataset => dataset && setWasteWaterData(filter(dataset, pangoLineage)));
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

  if (!variantDataset.getSelector().variant) {
    return <></>;
  }

  const subData = variantDataset.getSelector().location.country ? divisionSubData : countrySubData;

  return (
    <>
      <div>
        <VariantHeader
          dateRange={variantDataset.getSelector().dateRange!} // TODO is date range always available?
          variant={variantDataset.getSelector().variant!}
          controls={<FocusVariantHeaderControls selector={variantDataset.getSelector()} />}
        />
        {(!pangoLineage || pangoLineage.endsWith('*')) && (
          <div className='mx-0.5 mt-1 mb-5 md:mx-3 shadow-lg rounded-lg bg-white p-2 pl-4'>
            <VariantLineages onVariantSelect={onVariantSelect} selector={variantDataset.getSelector()} />{' '}
          </div>
        )}
        <PackedGrid maxColumns={2}>
          <GridCell minWidth={600}>
            {
              <VariantTimeDistributionChartWidget.ShareableComponent
                title='Sequences over time'
                height={300}
                variantSampleSet={DateCountSampleDataset.fromDetailedSampleAggDataset(variantDataset)}
                wholeSampleSet={DateCountSampleDataset.fromDetailedSampleAggDataset(wholeDataset)}
                toolbarChildren={[createDivisionBreakdownButton(setShowVariantTimeDistributionDivGrid)]}
              />
            }
          </GridCell>
          <GridCell minWidth={600}>
            <EstimatedCasesChartWidget.ShareableComponent
              caseCounts={caseCountDataset}
              variantDateCounts={DateCountSampleDataset.fromDetailedSampleAggDataset(variantDataset)}
              wholeDateCounts={DateCountSampleDataset.fromDetailedSampleAggDataset(wholeDataset)}
              height={300}
              title='Estimated cases'
              toolbarChildren={
                country === 'Switzerland' ? [createDivisionBreakdownButton(setShowEstimatedCasesDivGrid)] : []
              }
            />
          </GridCell>
          <GridCell minWidth={600}>
            {
              <VariantAgeDistributionChartWidget.ShareableComponent
                title='Age demographics'
                height={300}
                variantSampleSet={AgeCountSampleDataset.fromDetailedSampleAggDataset(variantDataset)}
                wholeSampleSet={AgeCountSampleDataset.fromDetailedSampleAggDataset(wholeDataset)}
                toolbarChildren={[createDivisionBreakdownButton(setShowVariantAgeDistributionDivGrid)]}
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
                variantName={variantDataset.getSelector().variant?.pangoLineage ?? 'unnamed variant'}
                title='Hospitalization probabilities'
                height={300}
                toolbarChildren={deepFocusButtons.hospitalizationAndDeath}
              />
            </GridCell>
          )}
          <GridCell minWidth={600}>
            <NamedCard
              title='Transmission advantage'
              toolbar={deepFocusButtons.chen2021Fitness}
              description={`
             If variants spread pre-dominantly by local transmission across demographic groups, this
             estimate reflects the transmission advantage of the focal variant. Importantly, the transmission
             advantage estimate reflects the advantage compared to co-circulating strains. Thus, as new variants
              spread, the advantage of the focal variant may decrease. When absolute numbers of a variant are low, the 
              advantage may merely reflect the current importance of introductions from abroad or
               the variant spreading in a particular demographic group. In this case, the estimate does not
                provide information on the transmission advantage.`}
            >
              <div style={{ height: 300 }}>
                <Chen2021FitnessPreview
                  locationSelector={variantDataset.getSelector().location}
                  variantSelector={variantDataset.getSelector().variant!}
                />
              </div>
            </NamedCard>
          </GridCell>
          <GridCell minWidth={600}>
            {
              <VariantDivisionDistributionChartWidget.ShareableComponent
                title='Geographic distribution'
                variantSampleSet={DivisionCountSampleDataset.fromDetailedSampleAggDataset(variantDataset)}
                wholeSampleSet={DivisionCountSampleDataset.fromDetailedSampleAggDataset(wholeDataset)}
              />
            }
          </GridCell>
          {wasteWaterSummaryPlot}
          {
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
          }
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
          <VariantMutations selector={variantDataset.getSelector()} />
        </div>
      </div>

      {/* The division breakdown plots */}
      {showVariantTimeDistributionDivGrid && subData && (
        <DivisionModal
          data={subData}
          generate={(division, d) => (
            <VariantTimeDistributionChartWidget.ShareableComponent
              variantSampleSet={DateCountSampleDataset.fromDetailedSampleAggDataset(d.variant)}
              wholeSampleSet={DateCountSampleDataset.fromDetailedSampleAggDataset(d.whole)}
              height={300}
              title={division}
            />
          )}
          show={showVariantTimeDistributionDivGrid}
          handleClose={() => setShowVariantTimeDistributionDivGrid(false)}
          header='Sequences over time'
        />
      )}
      {showEstimatedCasesDivGrid && divisionSubData && country === 'Switzerland' && (
        <DivisionModal
          data={divisionSubData}
          generate={(division, d) =>
            d.cases ? (
              <EstimatedCasesChartWidget.ShareableComponent
                caseCounts={d.cases}
                wholeDateCounts={DateCountSampleDataset.fromDetailedSampleAggDataset(d.whole)}
                variantDateCounts={DateCountSampleDataset.fromDetailedSampleAggDataset(d.variant)}
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
              variantSampleSet={AgeCountSampleDataset.fromDetailedSampleAggDataset(d.variant)}
              wholeSampleSet={AgeCountSampleDataset.fromDetailedSampleAggDataset(d.whole)}
              height={300}
              title={division}
            />
          )}
          show={showVariantAgeDistributionDivGrid}
          handleClose={() => setShowVariantAgeDistributionDivGrid(false)}
          header='Age demographics'
        />
      )}
    </>
  );
};
