import { useHistory, useLocation, useParams } from 'react-router';
import { useQuery } from '../helpers/query-hook';
import { fetchCollections } from '../data/api';
import React, { useMemo, useState } from 'react';
import Loader from '../components/Loader';
import { Link } from 'react-router-dom';
import { Button, ButtonVariant } from '../helpers/ui';
import {
  addVariantSelectorToUrlSearchParams,
  formatVariantDisplayName,
  VariantSelector,
} from '../data/VariantSelector';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
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

export const CollectionSingleViewPage = () => {
  const { collectionId: collectionIdStr }: { collectionId: string } = useParams();
  const collectionId = Number.parseInt(collectionIdStr);
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
  const { data: variantsDateCounts } = useQuery(
    signal =>
      variants
        ? Promise.all(
            variants.map(variant =>
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
          )
        : Promise.resolve(undefined),
    [variants, locationSelector]
  );
  const { data: baselineDateCounts } = useQuery(
    signal =>
      variants
        ? DateCountSampleData.fromApi(
            {
              host: undefined,
              qc: {},
              location: locationSelector,
              variant: undefined,
              samplingStrategy: SamplingStrategy.AllSamples,
              dateRange: dateRangeSelector,
            },
            signal
          )
        : Promise.resolve(undefined),
    [variants, locationSelector]
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
      <div className='w-96'>
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

      <Box className='mt-4' sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={(_, i) => setTab(i)}>
          <Tab label='Table' id='collection-tab-0' />
          <Tab label='Sequences over time' id='collection-tab-1' />
        </Tabs>
      </Box>
      <TabPanel value={tab} index={0}>
        {variants && variantsDateCounts && (
          <TableTabContent
            locationSelector={locationSelector}
            variants={variants}
            variantsDateCounts={variantsDateCounts}
          />
        )}
      </TabPanel>
      <TabPanel value={tab} index={1}>
        {variants && variantsDateCounts && baselineDateCounts && (
          <SequencesOverTimeTabContent
            variants={variants}
            variantsDateCounts={variantsDateCounts}
            baselineDateCounts={baselineDateCounts}
          />
        )}
      </TabPanel>
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
  variantsDateCounts: Dataset<LocationDateVariantSelector, DateCountSampleEntry[]>[];
};

const TableTabContent = ({ locationSelector, variants, variantsDateCounts }: TableTabContentProps) => {
  const tableColumns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      minWidth: 150,
      renderCell: (params: GridRenderCellParams<string>) => {
        const query = params.row.query;
        const urlParams = new URLSearchParams();
        addVariantSelectorToUrlSearchParams(query, urlParams);
        const placeString = encodeLocationSelectorToSingleString(locationSelector);
        return params.value ? (
          <Link to={`/explore/${placeString}/AllSamples/Past6M/variants?${urlParams.toString()}`}>
            <button className='underline'>
              <span className='w-60 text-ellipsis overflow-hidden block text-left'>{params.value}</span>
            </button>
          </Link>
        ) : (
          <></>
        );
      },
    },
    { field: 'queryFormatted', headerName: 'Query', minWidth: 300 },
    { field: 'total', headerName: 'Number sequences', minWidth: 150 },
    { field: 'description', headerName: 'Description', minWidth: 450 },
  ];

  const variantTableData = useMemo(() => {
    return variants.map((variant, i) => {
      return {
        id: i,
        ...variant,
        name: variant.name.length > 0 ? variant.name : formatVariantDisplayName(variant.query),
        queryFormatted: formatVariantDisplayName(variant.query),
        total: variantsDateCounts[i].payload.reduce((prev, curr) => prev + curr.count, 0),
      };
    });
  }, [variants, variantsDateCounts]);

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
  variantsDateCounts: Dataset<LocationDateVariantSelector, DateCountSampleEntry[]>[];
  baselineDateCounts: Dataset<LocationDateVariantSelector, DateCountSampleEntry[]>;
};

const SequencesOverTimeTabContent = ({
  variants,
  variantsDateCounts,
  baselineDateCounts,
}: SequencesOverTimeTabContentProps) => {
  return (
    <>
      <PackedGrid maxColumns={3}>
        {variants.map((variant, i) => (
          <GridCell minWidth={600} key={i}>
            <VariantTimeDistributionChartWidget.ShareableComponent
              title={variant.name}
              height={300}
              variantSampleSet={variantsDateCounts[i]}
              wholeSampleSet={baselineDateCounts}
            />
          </GridCell>
        ))}
      </PackedGrid>
    </>
  );
};
