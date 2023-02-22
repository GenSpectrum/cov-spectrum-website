import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '../helpers/query-hook';
import { fetchCollection } from '../data/api';
import React, { useMemo, useState } from 'react';
import Loader from '../components/Loader';
import { HashLink as Link } from 'react-router-hash-link';
import { Button, ButtonVariant } from '../helpers/ui';
import {
  formatVariantDisplayName,
  transformToVariantQuery,
  variantIsAllLineages,
  VariantSelector,
} from '../data/VariantSelector';

import { DateCountSampleData } from '../data/sample/DateCountSampleDataset';
import { SamplingStrategy } from '../data/SamplingStrategy';
import { PlaceSelect } from '../components/PlaceSelect';
import {
  addLocationSelectorToUrlSearchParams,
  getLocationSelectorFromUrlSearchParams,
  removeLocationSelectorToUrlSearchParams,
} from '../data/LocationSelector';
import { Box, FormControl, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import { DateRangeSelector, SpecialDateRangeSelector } from '../data/DateRangeSelector';
import { VariantSearchField } from '../components/VariantSearchField';
import { ErrorAlert } from '../components/ErrorAlert';
import { fetchNumberSubmittedSamplesInPastTenDays } from '../data/api-lapis';
import { Collection } from '../data/Collection';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import DateRangePicker from '../components/DateRangePicker';
import { addDefaultHostAndQc } from '../data/HostAndQcSelector';
import './style.css';
import MutationTableTabContent from '../components/MutationOverviewTable/MutationTableTabContent';
import TableTabContent from '../components/TableTabContent';
import SequencesOverTimeTabContent from '../components/SequencesOverTimeTabContent';
import { SequenceType } from '../data/SequenceType';

export const CollectionSingleViewPage = () => {
  const { collectionId: collectionIdStr } = useParams();
  const collectionId = Number.parseInt(collectionIdStr!);
  const [baselineVariant, setBaselineVariant] = useState<VariantSelector>({});
  // The following variable stores the visual value in the input field which is not necessarily already the applied
  const [baselineVariantInput, setBaselineVariantInput] = useState<VariantSelector>({});
  const navigate = useNavigate();
  const locationState = useLocation();
  const [tab, setTab] = useState(0);
  const [mutationType, setMutationType] = useState<SequenceType>('aa');

  // Parse filters from URL
  const queryString = locationState.search;
  const { locationSelector, highlightedOnly } = useMemo(() => {
    const queryParams = new URLSearchParams(queryString);
    return {
      locationSelector: getLocationSelectorFromUrlSearchParams(queryParams),
      highlightedOnly: queryParams.get('highlightedOnly') === 'true',
    };
  }, [queryString]);

  // Date range
  const [dateRangeSelector, setDateRangeSelector] = useState<DateRangeSelector>(
    new SpecialDateRangeSelector('Past6M')
  );

  // Fetch collection
  const { data: collection, isLoading } = useQuery(signal => fetchCollection(collectionId, signal), []);
  const variants = useMemo(
    () =>
      collection
        ? collection.variants
            .filter(v => (highlightedOnly ? v.highlighted : true))
            .map(v => ({
              ...v,
              query: JSON.parse(v.query) as VariantSelector,
            }))
        : undefined,
    [collection, highlightedOnly]
  );

  // Fetch number of sequences over time of the variants
  const { data: baselineAndVariantsDateCounts, error } = useQuery(
    async signal => {
      if (!variants) {
        return undefined;
      }
      const [baselineDateCounts, ...variantsDateCounts] = await Promise.allSettled(
        [{ query: baselineVariant }, ...variants].map(variant =>
          DateCountSampleData.fromApi(
            addDefaultHostAndQc({
              location: locationSelector,
              variant: variant.query,
              samplingStrategy: SamplingStrategy.AllSamples,
              dateRange: dateRangeSelector,
            }),
            signal
          )
        )
      );
      if (baselineDateCounts.status === 'rejected') {
        throw new Error(baselineDateCounts.reason);
      }
      return { baselineDateCounts: baselineDateCounts.value, variantsDateCounts };
    },
    [variants, locationSelector, baselineVariant, dateRangeSelector]
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
          if (variantIsAllLineages(baselineVariant)) {
            return Promise.resolve(baselineDateCounts);
          }
          const baselineVariantQuery = transformToVariantQuery(baselineVariant);
          const variantVariantQuery = transformToVariantQuery(variant.query);
          const variantSelector = variantIsAllLineages(variant.query)
            ? {}
            : {
                variantQuery: `(${variantVariantQuery})  | (${baselineVariantQuery})`,
              };
          return DateCountSampleData.fromApi(
            addDefaultHostAndQc({
              location: locationSelector,
              variant: variantSelector,
              samplingStrategy: SamplingStrategy.AllSamples,
              dateRange: dateRangeSelector,
            }),
            signal
          );
        })
      );
    },
    [variants, locationSelector, baselineVariant, baselineDateCounts, dateRangeSelector]
  );

  // Fetch the number of sequences submitted in the past 10 days
  const { data: variantsNumberNewSequences } = useQuery(
    async signal => {
      if (!variants) {
        return undefined;
      }
      return Promise.allSettled(
        variants.map(variant =>
          fetchNumberSubmittedSamplesInPastTenDays(
            addDefaultHostAndQc({
              location: locationSelector,
              variant: variant.query,
              samplingStrategy: SamplingStrategy.AllSamples,
            }),
            signal
          )
        )
      );
    },
    [variants, locationSelector]
  );

  // The "highlighted only" button can filter the set of variants that we look at. The following variable can be used
  // to check whether the datasets are about the same variants.
  const datasetsInSync =
    variants?.length === variantsDateCounts?.length && variants?.length === allWholeDateCounts?.length;

  // Rendering
  if (isLoading) {
    return <Loader />;
  }

  if (!collection) {
    return (
      <>
        <h1>Collection not found</h1>
        <p>The collection does not exist.</p>

        <Link to='/collections'>
          <Button variant={ButtonVariant.PRIMARY} className='w-48 my-4'>
            Go back to overview
          </Button>
        </Link>
      </>
    );
  }

  const onChangeDate = (dateRangeSelector: DateRangeSelector) => {
    setDateRangeSelector(dateRangeSelector);
  };

  const handleMutationTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMutationType((event.target as HTMLInputElement).value as SequenceType);
  };

  return (
    <>
      <CollectionSinglePageTitle collection={collection} />
      <p className='italic'>Maintained by {collection.maintainers}</p>
      <p className='whitespace-pre-wrap'>{collection.description}</p>
      <h2>Variants</h2>
      {/* Filters */}
      <div className='w-full sm:w-96'>
        <PlaceSelect
          onSelect={selector => {
            const queryParams = new URLSearchParams(queryString);
            removeLocationSelectorToUrlSearchParams(queryParams);
            addLocationSelectorToUrlSearchParams(selector, queryParams);
            navigate(locationState.pathname + '?' + queryParams.toString());
          }}
          selected={locationSelector}
        />
      </div>

      {/* Baseline variant */}

      <div className='mt-8'>
        <DateRangePicker dateRangeSelector={dateRangeSelector} onChangeDate={onChangeDate} />
      </div>

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

      {/* Highlighted only button */}
      {highlightedOnly ? (
        <Button
          variant={ButtonVariant.PRIMARY}
          className='w-48 mt-4'
          onClick={() => {
            const queryParams = new URLSearchParams(queryString);
            queryParams.delete('highlightedOnly');
            navigate(locationState.pathname + '?' + queryParams.toString());
          }}
        >
          <AiFillStar size='1.5em' className='text-yellow-400 inline' /> only
        </Button>
      ) : (
        <Button
          variant={ButtonVariant.SECONDARY}
          className='w-48 mt-4'
          onClick={() => {
            const queryParams = new URLSearchParams(queryString);
            queryParams.delete('highlightedOnly');
            queryParams.set('highlightedOnly', 'true');
            navigate(locationState.pathname + '?' + queryParams.toString());
          }}
        >
          <AiOutlineStar size='1.5em' className='inline' /> only
        </Button>
      )}

      {!error ? (
        <>
          <Box className='mt-4' sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tab} onChange={(_, i) => setTab(i)}>
              <Tab label='Table' id='collection-tab-0' />
              <Tab label='Sequences over time' id='collection-tab-1' />
              <Tab label='Mutations' id='collection-tab-2' />
            </Tabs>
          </Box>
          <TabPanel value={tab} index={0}>
            {variants &&
            variantsDateCounts &&
            variantsNumberNewSequences &&
            allWholeDateCounts &&
            datasetsInSync ? (
              <TableTabContent
                collectionId={collectionId}
                locationSelector={locationSelector}
                variants={variants}
                variantsDateCounts={variantsDateCounts}
                variantsNumberNewSequences={variantsNumberNewSequences}
                allWholeDateCounts={allWholeDateCounts}
                dateRangeSelector={dateRangeSelector}
              />
            ) : (
              <Loader />
            )}
          </TabPanel>
          <TabPanel value={tab} index={1}>
            {variants && variantsDateCounts && baselineDateCounts && datasetsInSync ? (
              <SequencesOverTimeTabContent
                collection={collection}
                variants={variants}
                variantsDateCounts={variantsDateCounts}
                baselineDateCounts={baselineDateCounts}
                mode={variantIsAllLineages(baselineVariant) ? 'Single' : 'CompareToBaseline'}
              />
            ) : (
              <Loader />
            )}
          </TabPanel>
          <TabPanel value={tab} index={2}>
            <FormControl>
              <RadioGroup value={mutationType} onChange={handleMutationTypeChange}>
                <FormControlLabel value='aa' control={<Radio />} label='Amino acid mutations' />
                <FormControlLabel value='nuc' control={<Radio />} label='Nucleotid mutations' />
              </RadioGroup>
            </FormControl>

            {variants ? (
              <MutationTableTabContent
                mode={variantIsAllLineages(baselineVariant) ? 'Single' : 'CompareToBaseline'}
                dateRangeSelector={dateRangeSelector}
                mutationType={mutationType}
                locationSelector={locationSelector}
                variants={variants}
                baselineVariant={baselineVariant}
              />
            ) : (
              <Loader />
            )}
          </TabPanel>
        </>
      ) : (
        <ErrorAlert messages={[error]} />
      )}
    </>
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
          <Typography component='span'>{children}</Typography>
        </Box>
      )}
    </div>
  );
};

type CollectionSinglePageTitleProps = {
  collection: Collection;
};

export const CollectionSinglePageTitle = ({ collection }: CollectionSinglePageTitleProps) => {
  return (
    <h1>
      <span className='text-gray-400 font-normal'>#{collection.id}</span> {collection.title}
    </h1>
  );
};
