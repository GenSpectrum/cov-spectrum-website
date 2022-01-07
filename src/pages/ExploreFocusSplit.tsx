import React, { useEffect, useState } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router';
import {
  RawFullContentWrapper,
  SplitExploreWrapper,
  SplitFocusWrapper,
  SplitParentWrapper,
} from '../helpers/app-layout';
import { useExploreUrl } from '../helpers/explore-url';
import { DeepFocusPage } from './DeepFocusPage';
import { ExplorePage } from './ExplorePage';
import { DeepExplorePage } from './DeepExplorePage';
import { DetailedSampleAggData } from '../data/sample/DetailedSampleAggDataset';
import { CaseCountAsyncDataset, CaseCountData } from '../data/CaseCountDataset';
import { DateCountSampleData } from '../data/sample/DateCountSampleDataset';
import { CountryDateCountSampleData } from '../data/sample/CountryDateCountSampleDataset';
import Loader from '../components/Loader';
import { useQuery } from '../helpers/query-hook';
import { FocusVariantHeaderControls } from '../components/FocusVariantHeaderControls';
import { VariantHeader } from '../components/VariantHeader';
import { LocationDateVariantSelector } from '../data/LocationDateVariantSelector';
import { isEqual } from 'lodash';
import { SamplingStrategy } from '../data/SamplingStrategy';
import { VariantSearch } from '../components/VariantSearch';
import { DateRangePicker } from '../components/DateRangePicker';
import { InternalLink } from '../components/InternalLink';
import { useAsyncDataset } from '../helpers/use-async-dataset';

interface Props {
  isSmallScreen: boolean;
}

export const ExploreFocusSplit = ({ isSmallScreen }: Props) => {
  const {
    validUrl,
    location,
    samplingStrategy,
    dateRange,
    variant,
    focusKey,
    setVariant,
  } = useExploreUrl() ?? {
    validUrl: true,
    samplingStrategy: SamplingStrategy.AllSamples,
  };

  const [variantSelector, setVariantSelector] = useState<LocationDateVariantSelector>();

  const variantDataset = useQuery(
    signal =>
      DetailedSampleAggData.fromApi({ location: location!, samplingStrategy, dateRange, variant }, signal),
    [dateRange, location, variant, samplingStrategy]
  );

  useEffect(() => {
    if (variantDataset.isSuccess && variantDataset.data!.selector.variant) {
      setVariantSelector(variantDataset.data!.selector);
    }
  }, [variantDataset]);

  const wholeDatasetWithoutDateFilter = useQuery(
    // Used by the explore page
    signal => DetailedSampleAggData.fromApi({ location: location!, samplingStrategy }, signal),
    [location, samplingStrategy]
  );
  const wholeDateCountSampleDatasetWithoutDateFilter = useQuery(
    // Used by the explore page
    signal => DateCountSampleData.fromApi({ location: location!, samplingStrategy }, signal),
    [location, samplingStrategy]
  );
  const wholeDatasetWithDateFilter = useQuery(
    // Used by the focus page
    signal => DetailedSampleAggData.fromApi({ location: location!, dateRange, samplingStrategy }, signal),
    [location, dateRange, samplingStrategy]
  );

  const caseCountDataset: CaseCountAsyncDataset = useAsyncDataset(
    { location: location! },
    ({ selector }, { signal }) => CaseCountData.fromApi(selector, signal)
  );

  const wholeInternationalDateCountDataset = useQuery(
    signal => CountryDateCountSampleData.fromApi({ location: {}, dateRange, samplingStrategy }, signal),
    [dateRange, samplingStrategy]
  );
  const variantInternationalDateCountDataset = useQuery(
    signal =>
      CountryDateCountSampleData.fromApi({ location: {}, dateRange, samplingStrategy, variant }, signal),
    [dateRange, variant, samplingStrategy]
  );

  const { path } = useRouteMatch();

  if (!validUrl) {
    // This may happen during a redirect
    return null;
  }

  interface ExploreProperties {
    isSmallScreen: boolean;
    isLandingPage?: boolean;
  }

  const getExplorePage = ({ isSmallScreen }: ExploreProperties) =>
    wholeDateCountSampleDatasetWithoutDateFilter.data ? (
      <ExplorePage
        onVariantSelect={setVariant!}
        selection={variant}
        wholeDateCountSampleDataset={wholeDateCountSampleDatasetWithoutDateFilter.data}
        isSmallExplore={isSmallScreen}
      />
    ) : (
      <Loader />
    );
  const deepExplorePage = wholeDatasetWithoutDateFilter.isSuccess ? (
    <DeepExplorePage wholeDataset={wholeDatasetWithoutDateFilter.data!} caseCountDataset={caseCountDataset} />
  ) : (
    <Loader />
  );

  const makeLayout = (focusContent: React.ReactNode, deepFocusContent: React.ReactNode): JSX.Element => (
    <>
      <Switch>
        <Route exact path={`${path}/variants`}>
          {isSmallScreen ? (
            <SplitParentWrapper>
              <SplitExploreWrapper>{getExplorePage({ isSmallScreen: true })}</SplitExploreWrapper>
              <SplitFocusWrapper>{focusContent}</SplitFocusWrapper>
            </SplitParentWrapper>
          ) : (
            <SplitParentWrapper>
              <SplitExploreWrapper>{getExplorePage({ isSmallScreen: false })}</SplitExploreWrapper>
              <SplitFocusWrapper>{focusContent}</SplitFocusWrapper>
            </SplitParentWrapper>
          )}
        </Route>
        <Route path={`${path}/variants`}>
          <RawFullContentWrapper>{deepFocusContent}</RawFullContentWrapper>
        </Route>
        <Route path={`${path}`}>
          <RawFullContentWrapper>{deepExplorePage}</RawFullContentWrapper>
        </Route>
      </Switch>
    </>
  );

  return makeLayout(
    <>
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
          <DateRangePicker dateRangeSelector={dateRange!} />
        </div>
        <div className='m-1 flex-grow'>
          <VariantSearch onVariantSelect={setVariant!} currentSelection={variant} isSimple={isSmallScreen} />
        </div>
      </div>
      {variantSelector && isEqual(variant, variantSelector.variant) && (
        <VariantHeader
          dateRange={variantSelector.dateRange!} // TODO is date range always available?
          variant={variantSelector.variant!}
          controls={<FocusVariantHeaderControls selector={variantSelector} />}
        />
      )}
    </>,
    variant &&
      variantDataset.isSuccess &&
      wholeDatasetWithDateFilter.isSuccess &&
      variantInternationalDateCountDataset.isSuccess &&
      wholeInternationalDateCountDataset.isSuccess ? (
      <DeepFocusPage
        key={focusKey}
        variantDataset={variantDataset.data!}
        wholeDataset={wholeDatasetWithDateFilter.data!}
        variantInternationalDateCountDataset={variantInternationalDateCountDataset.data!}
        wholeInternationalDateCountDataset={wholeInternationalDateCountDataset.data!}
      />
    ) : (
      <Loader />
    )
  );
};
