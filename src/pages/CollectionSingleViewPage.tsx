import { useHistory, useLocation, useParams } from 'react-router';
import { useQuery } from '../helpers/query-hook';
import { fetchCollections } from '../data/api';
import React, { useEffect, useMemo, useState } from 'react';
import Loader from '../components/Loader';
import { Link } from 'react-router-dom';
import { Button, ButtonVariant } from '../helpers/ui';
import {
  addVariantSelectorToUrlSearchParams,
  formatVariantDisplayName,
  transformToVariantQuery,
  variantIsAllLineages,
  VariantSelector,
} from '../data/VariantSelector';
import { DataGrid, GridColDef, GridComparatorFn, GridRenderCellParams } from '@mui/x-data-grid';
import { DateCountSampleData } from '../data/sample/DateCountSampleDataset';
import { SamplingStrategy } from '../data/SamplingStrategy';
import { PlaceSelect } from '../components/PlaceSelect';
import {
  addLocationSelectorToUrlSearchParams,
  encodeLocationSelectorToSingleString,
  getLocationSelectorFromUrlSearchParams,
  LocationSelector,
} from '../data/LocationSelector';
import { Box } from '@mui/material';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import { Dataset } from '../data/Dataset';
import { DateCountSampleEntry } from '../data/sample/DateCountSampleEntry';
import { LocationDateVariantSelector } from '../data/LocationDateVariantSelector';
import { GridCell, PackedGrid } from '../components/PackedGrid';
import { VariantTimeDistributionChartWidget } from '../widgets/VariantTimeDistributionChartWidget';
import { SpecialDateRangeSelector } from '../data/DateRangeSelector';
import { Chen2021FitnessResponse, ValueWithCI } from '../models/chen2021Fitness/chen2021Fitness-types';
import { PromiseQueue } from '../helpers/PromiseQueue';
import { getModelData } from '../models/chen2021Fitness/loading';
import { VariantSearchField } from '../components/VariantSearchField';
import { ErrorAlert } from '../components/ErrorAlert';

export const CollectionSingleViewPage = () => {
  const { collectionId: collectionIdStr }: { collectionId: string } = useParams();
  const collectionId = Number.parseInt(collectionIdStr);
  const [baselineVariant, setBaselineVariant] = useState<VariantSelector>({});
  // The following variable stores the visual value in the input field which is not necessarily already the applied
  const [baselineVariantInput, setBaselineVariantInput] = useState<VariantSelector>({});
  const history = useHistory();
  const locationState = useLocation();
  const [tab, setTab] = useState(0);

  // Parse filters from URL
  const queryString = locationState.search;
  const locationSelector = useMemo(() => {
    const queryParams = new URLSearchParams(queryString);
    return getLocationSelectorFromUrlSearchParams(queryParams);
  }, [queryString]);
  const dateRangeSelector = new SpecialDateRangeSelector('Past6M'); // TODO

  // Fetch collection
  const { data: collections } = useQuery(signal => fetchCollections(signal), []);
  const collection = useMemo(() => collections?.find(c => c.id === collectionId), [
    collectionId,
    collections,
  ]);
  const variants = useMemo(
    () =>
      collection
        ? collection.variants.map(v => ({
            ...v,
            query: JSON.parse(v.query) as VariantSelector,
          }))
        : undefined,
    [collection]
  );

  // Fetch data about the variants
  const { data: baselineAndVariantsDateCounts, error } = useQuery(
    async signal => {
      if (!variants) {
        return undefined;
      }
      const [baselineDateCounts, ...variantsDateCounts] = await Promise.allSettled(
        [{ query: baselineVariant }, ...variants].map(variant =>
          DateCountSampleData.fromApi(
            {
              host: undefined,
              qc: {},
              location: locationSelector,
              variant: variant.query,
              samplingStrategy: SamplingStrategy.AllSamples,
              dateRange: dateRangeSelector,
            },
            signal
          )
        )
      );
      if (baselineDateCounts.status === 'rejected') {
        throw new Error(baselineDateCounts.reason);
      }
      return { baselineDateCounts: baselineDateCounts.value, variantsDateCounts };
    },
    [variants, locationSelector, baselineVariant]
  );
  const { baselineDateCounts, variantsDateCounts } = baselineAndVariantsDateCounts ?? {
    baselineDateCounts: undefined,
    variantsDateCounts: undefined,
  };
  // If no baseline variant is selected, baselineDateCounts includes all lineages. Then, the wholeDateCounts (which are relevant for the relative advantage calculation) for all
  // variants in the collection is just that. If a baseline is selected, the wholeDateCounts for a variant is the union
  // of the baseline variant and the focal variant.
  // In following, we fetch the wholeDateCounts if necessary.
  const { data: allWholeDateCounts } = useQuery(
    async signal => {
      if (!variants || !baselineDateCounts) {
        return undefined;
      }
      return Promise.allSettled(
        variants.map(variant => {
          if (!variantIsAllLineages(baselineVariant)) {
            return DateCountSampleData.fromApi(
              {
                host: undefined,
                qc: {},
                location: locationSelector,
                variant: {
                  variantQuery: `(${transformToVariantQuery(variant.query)})  | (${transformToVariantQuery(
                    baselineVariant
                  )})`,
                },
                samplingStrategy: SamplingStrategy.AllSamples,
                dateRange: dateRangeSelector,
              },
              signal
            );
          } else {
            return Promise.resolve(baselineDateCounts);
          }
        })
      );
    },
    [variants, locationSelector, baselineVariant, baselineDateCounts]
  );

  // Rendering
  if (!collections) {
    return <Loader />;
  }

  if (!collection) {
    return (
      <div className='mx-8 my-4'>
        <h1>Collection not found</h1>
        <p>The collection does not exist.</p>

        <Link to='/collections'>
          <Button variant={ButtonVariant.PRIMARY} className='w-48 my-4'>
            Go back to overview
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className='mx-8 my-4'>
      <h1>{collection.title}</h1>
      <p className='italic'>Maintained by {collection.maintainers}</p>
      <p className='whitespace-pre-wrap'>{collection.description}</p>
      <h2>Variants</h2>
      {/* Filters */}
      <div className='w-full sm:w-96'>
        <PlaceSelect
          onSelect={selector => {
            const queryParams = new URLSearchParams();
            addLocationSelectorToUrlSearchParams(selector, queryParams);
            history.push(locationState.pathname + '?' + queryParams.toString());
          }}
          selected={locationSelector}
        />
      </div>
      <div>
        Using data from the <strong>past 6 months</strong>
      </div>
      {/* Baseline variant */}
      <div className='mt-4'>
        <p>
          <strong>Baseline:</strong> You can select a baseline variant to compare the variants in the
          collection against that variant.{' '}
          <strong>
            Currently,{' '}
            {variantIsAllLineages(baselineVariant)
              ? 'no baseline variant is selected'
              : `the baseline variant is ${formatVariantDisplayName(baselineVariant)}`}
            .
          </strong>
        </p>
        <VariantSearchField
          isSimple={false}
          onVariantSelect={setBaselineVariantInput}
          triggerSearch={() => setBaselineVariant(baselineVariantInput)}
        />
        <Button
          className='w-48'
          variant={ButtonVariant.PRIMARY}
          onClick={() => setBaselineVariant(baselineVariantInput)}
        >
          Select baseline
        </Button>
      </div>

      {!error ? (
        <>
          <Box className='mt-4' sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tab} onChange={(_, i) => setTab(i)}>
              <Tab label='Table' id='collection-tab-0' />
              <Tab label='Sequences over time' id='collection-tab-1' />
            </Tabs>
          </Box>
          <TabPanel value={tab} index={0}>
            {variants && variantsDateCounts && allWholeDateCounts ? (
              <TableTabContent
                locationSelector={locationSelector}
                variants={variants}
                variantsDateCounts={variantsDateCounts}
                allWholeDateCounts={allWholeDateCounts}
              />
            ) : (
              <Loader />
            )}
          </TabPanel>
          <TabPanel value={tab} index={1}>
            {variants && variantsDateCounts && baselineDateCounts ? (
              <SequencesOverTimeTabContent
                variants={variants}
                variantsDateCounts={variantsDateCounts}
                baselineDateCounts={baselineDateCounts}
                mode={variantIsAllLineages(baselineVariant) ? 'Single' : 'CompareToBaseline'}
              />
            ) : (
              <Loader />
            )}
          </TabPanel>
        </>
      ) : (
        <ErrorAlert messages={[error]} />
      )}
    </div>
  );
};

type TabPanelProps = {
  children?: React.ReactNode;
  index: number;
  value: number;
};

const TabPanel = ({ children, value, index, ...other }: TabPanelProps) => {
  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
};

type TableTabContentProps = {
  locationSelector: LocationSelector;
  variants: { query: VariantSelector; name: string; description: string }[];
  variantsDateCounts: PromiseSettledResult<Dataset<LocationDateVariantSelector, DateCountSampleEntry[]>>[];
  allWholeDateCounts: PromiseSettledResult<Dataset<LocationDateVariantSelector, DateCountSampleEntry[]>>[];
};

const TableTabContent = ({
  locationSelector,
  variants,
  variantsDateCounts,
  allWholeDateCounts,
}: TableTabContentProps) => {
  // Fetch relative growth advantage
  const [relativeAdvantages, setRelativeAdvantages] = useState<(Chen2021FitnessResponse | undefined)[]>([]);
  useEffect(() => {
    const fetchQueue = new PromiseQueue();
    for (let i = 0; i < variantsDateCounts.length; i++) {
      const variantDateCountsStatus = variantsDateCounts[i];
      const allWholeDateCountsStatus = allWholeDateCounts[i];
      if (variantDateCountsStatus.status === 'rejected' || allWholeDateCountsStatus.status === 'rejected') {
        fetchQueue.addTask(() => {
          return new Promise<void>(resolve => {
            setRelativeAdvantages(prev => [...prev, undefined]);
            resolve();
          });
        });
        return;
      }
      const variantDateCounts = variantDateCountsStatus.value;
      const wholeDateCounts = allWholeDateCountsStatus.value;
      const totalSequences = variantDateCounts.payload.reduce((prev, curr) => prev + curr.count, 0);
      fetchQueue.addTask(() => {
        if (totalSequences > 0) {
          return getModelData(variantDateCounts, wholeDateCounts, { generationTime: 7 }).then(
            ({ response }) => {
              setRelativeAdvantages(prev => [...prev, response]);
            }
          );
        } else {
          // No need to calculate the advantage if there is no available sequence
          return new Promise<void>(resolve => {
            setRelativeAdvantages(prev => [...prev, undefined]);
            resolve();
          });
        }
      });
    }
  }, [variantsDateCounts, allWholeDateCounts, setRelativeAdvantages]);

  // Table definition and data
  const tableColumns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<string>) => {
        const query = params.row.query;
        const urlParams = new URLSearchParams();
        addVariantSelectorToUrlSearchParams(query, urlParams);
        const placeString = encodeLocationSelectorToSingleString(locationSelector);
        return params.value ? (
          <Link to={`/explore/${placeString}/AllSamples/Past6M/variants?${urlParams.toString()}`}>
            <button className='underline'>{params.value}</button>
          </Link>
        ) : (
          <></>
        );
      },
    },
    { field: 'queryFormatted', headerName: 'Query', minWidth: 300 },
    { field: 'total', headerName: 'Number sequences', minWidth: 150 },
    {
      field: 'advantage',
      headerName: 'Relative growth advantage',
      minWidth: 200,
      sortComparator: sortRelativeGrowthAdvantageValues,
    },
    {
      field: 'advantageCiLower',
      headerName: 'CI (low)',
      minWidth: 100,
      sortComparator: sortRelativeGrowthAdvantageValues,
    },
    {
      field: 'advantageCiUpper',
      headerName: 'CI (high)',
      minWidth: 100,
      sortComparator: sortRelativeGrowthAdvantageValues,
    },
    { field: 'description', headerName: 'Description', minWidth: 450 },
  ];

  const variantTableData = useMemo(() => {
    return variants.map((variant, i) => {
      const advantage =
        relativeAdvantages.length > i ? relativeAdvantages[i]?.params.fd ?? 'failed' : undefined;
      let errorMessage: string | undefined = undefined;
      if (advantage === 'failed') {
        errorMessage = "Can't be calculated";
      } else if (!advantage) {
        errorMessage = 'Calculating...';
      }
      const vcd = variantsDateCounts[i];
      if (vcd.status === 'fulfilled') {
        return {
          id: i,
          ...variant,
          name: variant.name.length > 0 ? variant.name : formatVariantDisplayName(variant.query),
          queryFormatted: formatVariantDisplayName(variant.query),
          total: vcd.value.payload.reduce((prev, curr) => prev + curr.count, 0),
          advantage: errorMessage ?? ((advantage as ValueWithCI).value * 100).toFixed(2) + '%',
          advantageCiLower: errorMessage
            ? '...'
            : ((advantage as ValueWithCI).ciLower * 100).toFixed(2) + '%',
          advantageCiUpper: errorMessage
            ? '...'
            : ((advantage as ValueWithCI).ciUpper * 100).toFixed(2) + '%',
        };
      } else {
        return {
          id: i,
          ...variant,
          name: variant.name.length > 0 ? variant.name : formatVariantDisplayName(variant.query),
          queryFormatted: formatVariantDisplayName(variant.query),
          total: vcd.reason,
          advantage: '-',
          advantageCiLower: '-',
          advantageCiUpper: '-',
        };
      }
    });
  }, [variants, variantsDateCounts, relativeAdvantages]);

  return (
    <>
      {variantTableData ? (
        <div className='mt-4'>
          <DataGrid
            columns={tableColumns}
            rows={variantTableData}
            autoHeight={true}
            getRowHeight={() => 'auto'}
            density={'compact'}
          />
        </div>
      ) : (
        <Loader />
      )}
    </>
  );
};

type SequencesOverTimeTabContentProps = {
  variants: { query: VariantSelector; name: string; description: string }[];
  variantsDateCounts: PromiseSettledResult<Dataset<LocationDateVariantSelector, DateCountSampleEntry[]>>[];
  baselineDateCounts: Dataset<LocationDateVariantSelector, DateCountSampleEntry[]>;
  mode: 'Single' | 'CompareToBaseline';
};

const sortRelativeGrowthAdvantageValues: GridComparatorFn<string> = (a, b) => {
  if (!a.endsWith('%') && !b.endsWith('%')) {
    return 0;
  }
  if (!a.endsWith('%')) {
    return -1;
  }
  if (!b.endsWith('%')) {
    return 1;
  }
  const aNumber = Number.parseFloat(a.substr(0, a.length - 1));
  const bNumber = Number.parseFloat(b.substr(0, a.length - 1));
  return aNumber - bNumber;
};

const SequencesOverTimeTabContent = ({
  variants,
  variantsDateCounts,
  baselineDateCounts,
  mode,
}: SequencesOverTimeTabContentProps) => {
  return (
    <>
      <PackedGrid maxColumns={3}>
        {variants.map((variant, i) => {
          const vdc = variantsDateCounts[i];
          if (vdc.status === 'fulfilled') {
            return (
              <GridCell minWidth={600} key={i}>
                <VariantTimeDistributionChartWidget.ShareableComponent
                  title={mode === 'Single' ? variant.name : `Comparing ${variant.name} to baseline`}
                  height={300}
                  variantSampleSet={vdc.value}
                  wholeSampleSet={baselineDateCounts}
                />
              </GridCell>
            );
          } else {
            return (
              <GridCell minWidth={600} key={i}>
                <ErrorAlert messages={[vdc.reason.message]} />
              </GridCell>
            );
          }
        })}
      </PackedGrid>
    </>
  );
};
