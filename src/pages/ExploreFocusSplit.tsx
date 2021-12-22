import React, { useEffect, useMemo, useState } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router';
import {
  RawFullContentWrapper,
  ScrollableFullContentWrapper,
  SplitExploreWrapper,
  SplitFocusWrapper,
  SplitParentWrapper,
} from '../helpers/app-layout';
import { useExploreUrl } from '../helpers/explore-url';
import { DeepFocusPage } from './DeepFocusPage';
import { ExplorePage } from './ExplorePage';
import { FocusPage } from './FocusPage';
import { DeepExplorePage } from './DeepExplorePage';
import { DetailedSampleAggData } from '../data/sample/DetailedSampleAggDataset';
import { CaseCountAsyncDataset, CaseCountData } from '../data/CaseCountDataset';
import { DateCountSampleData, DateCountSampleDataset } from '../data/sample/DateCountSampleDataset';
import { CountryDateCountSampleData } from '../data/sample/CountryDateCountSampleDataset';
import Loader from '../components/Loader';
import { useQuery } from '../helpers/query-hook';
import { PromiseFn, useAsync } from 'react-async';
import { useDeepCompareMemo } from '../helpers/deep-compare-hooks';
import { AsyncDataset } from '../data/AsyncDataset';
import { Dataset } from '../data/Dataset';
import { FocusVariantHeaderControls } from '../components/FocusVariantHeaderControls';
import { VariantHeader } from '../components/VariantHeader';
import { LocationDateVariantSelector } from '../data/LocationDateVariantSelector';
import { isEqual } from 'lodash';
import { SamplingStrategy } from '../data/SamplingStrategy';
import { VariantSearch } from '../components/VariantSearch';

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
  const wholeDateCountSampleDatasetWithoutDateFilter: DateCountSampleDataset | undefined = useMemo(() => {
    if (wholeDatasetWithoutDateFilter.isSuccess && wholeDatasetWithoutDateFilter.data) {
      return DateCountSampleData.fromDetailedSampleAggDataset(wholeDatasetWithoutDateFilter.data);
    }
  }, [wholeDatasetWithoutDateFilter.isSuccess, wholeDatasetWithoutDateFilter.data]);
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

  const getExplorePage = ({ isSmallScreen, isLandingPage = false }: ExploreProperties) =>
    wholeDateCountSampleDatasetWithoutDateFilter ? (
      <ExplorePage
        onVariantSelect={setVariant!}
        selection={variant}
        wholeDateCountSampleDataset={wholeDateCountSampleDatasetWithoutDateFilter}
        caseCountDataset={caseCountDataset}
        isSmallExplore={isSmallScreen}
        isLandingPage={isLandingPage}
        wholeDataset={wholeDatasetWithoutDateFilter.data!}
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
        <Route exact path={`${path}`}>
          <ScrollableFullContentWrapper>
            {getExplorePage({ isSmallScreen: isSmallScreen, isLandingPage: true })}
          </ScrollableFullContentWrapper>
        </Route>
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
      <div id='variant-search-bar'>
        <VariantSearch onVariantSelect={setVariant!} currentSelection={variant} isSimple={isSmallScreen} />
      </div>
      {variantSelector && isEqual(variant, variantSelector.variant) && (
        <VariantHeader
          dateRange={variantSelector.dateRange!} // TODO is date range always available?
          variant={variantSelector.variant!}
          controls={<FocusVariantHeaderControls selector={variantSelector} />}
        />
      )}
      {variant &&
      variantDataset.isSuccess &&
      wholeDatasetWithDateFilter.isSuccess &&
      variantInternationalDateCountDataset.isSuccess &&
      wholeInternationalDateCountDataset.isSuccess ? (
        <FocusPage
          key={focusKey}
          variantDataset={variantDataset.data!}
          wholeDataset={wholeDatasetWithDateFilter.data!}
          caseCountDataset={caseCountDataset}
          variantInternationalDateCountDataset={variantInternationalDateCountDataset.data!}
          wholeInternationalDateCountDataset={wholeInternationalDateCountDataset.data!}
          onVariantSelect={setVariant!}
        />
      ) : (
        <Loader />
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

/**
 * This hook returns an AsyncDataset and updates it when the selector changes. It does not watch for changes of the
 * promiseFn.
 */
function useAsyncDataset<Selector, Payload>(
  selector: Selector,
  promiseFn: PromiseFn<Dataset<Selector, Payload>>
): AsyncDataset<Selector, Payload> {
  const { memorizedPromiseFn, memorizedSelector } = useDeepCompareMemo(
    () => ({
      memorizedSelector: selector,
      memorizedPromiseFn: promiseFn,
    }),
    [selector]
  );
  const caseCountDatasetAsync = useAsync(memorizedPromiseFn, { selector });
  return useMemo(
    () => ({
      selector: memorizedSelector,
      payload: caseCountDatasetAsync.data?.payload,
      status: caseCountDatasetAsync.status,
    }),
    [caseCountDatasetAsync, memorizedSelector]
  );
}
