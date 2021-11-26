import React, { useEffect, useMemo, useState } from 'react';
import { Route, Switch, useRouteMatch } from 'react-router';
import {
  SplitExploreWrapper,
  SplitFocusWrapper,
  RawFullContentWrapper,
  ScrollableFullContentWrapper,
  SplitParentWrapper,
} from '../helpers/app-layout';
import { useExploreUrl } from '../helpers/explore-url';
import { DeepFocusPage } from './DeepFocusPage';
import { ExplorePage } from './ExplorePage';
import { FocusEmptyPage } from './FocusEmptyPage';
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

interface Props {
  isSmallScreen: boolean;
}

export const ExploreFocusSplit = ({ isSmallScreen }: Props) => {
  const { validUrl, location, dateRange, variant, focusKey, setVariant } = useExploreUrl() ?? {
    validUrl: true,
  };

  const [variantSelector, setVariantSelector] = useState<LocationDateVariantSelector>();

  const variantDataset = useQuery(
    signal => DetailedSampleAggData.fromApi({ location: location!, dateRange, variant }, signal),
    [dateRange, location, variant]
  );

  useEffect(() => {
    if (variantDataset.isSuccess && variantDataset.data!.selector.variant) {
      setVariantSelector(variantDataset.data!.selector);
    }
  }, [variantDataset]);

  const wholeDatasetWithoutDateFilter = useQuery(
    // Used by the explore page
    signal => DetailedSampleAggData.fromApi({ location: location! }, signal),
    [location]
  );
  const wholeDateCountSampleDatasetWithoutDateFilter: DateCountSampleDataset | undefined = useMemo(() => {
    if (wholeDatasetWithoutDateFilter.isSuccess && wholeDatasetWithoutDateFilter.data) {
      return DateCountSampleData.fromDetailedSampleAggDataset(wholeDatasetWithoutDateFilter.data);
    }
  }, [wholeDatasetWithoutDateFilter.isSuccess, wholeDatasetWithoutDateFilter.data]);
  const wholeDatasetWithDateFilter = useQuery(
    // Used by the focus page
    signal => DetailedSampleAggData.fromApi({ location: location!, dateRange }, signal),
    [location, dateRange]
  );

  const caseCountDataset: CaseCountAsyncDataset = useAsyncDataset(
    { location: location! },
    ({ selector }, { signal }) => CaseCountData.fromApi(selector, signal)
  );

  const wholeInternationalDateCountDataset = useQuery(
    signal => CountryDateCountSampleData.fromApi({ location: {}, dateRange }, signal),
    [dateRange]
  );
  const variantInternationalDateCountDataset = useQuery(
    signal => CountryDateCountSampleData.fromApi({ location: {}, dateRange, variant }, signal),
    [dateRange, variant]
  );

  const { path } = useRouteMatch();

  if (!validUrl) {
    // This may happen during a redirect
    return null;
  }

  const explorePage = (isSmallExplore = false) =>
    wholeDateCountSampleDatasetWithoutDateFilter ? (
      <ExplorePage
        onVariantSelect={setVariant!}
        selection={variant}
        wholeDateCountSampleDataset={wholeDateCountSampleDatasetWithoutDateFilter}
        caseCountDataset={caseCountDataset}
        isSmallExplore={isSmallExplore}
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
          {isSmallScreen ? (
            <ScrollableFullContentWrapper>{explorePage(false)}</ScrollableFullContentWrapper>
          ) : (
            <SplitParentWrapper>
              <SplitExploreWrapper>{explorePage(false)}</SplitExploreWrapper>
              <SplitFocusWrapper>
                <FocusEmptyPage />
              </SplitFocusWrapper>
            </SplitParentWrapper>
          )}
        </Route>
        <Route exact path={`${path}/variants`}>
          {isSmallScreen ? (
            <SplitParentWrapper>
              <SplitExploreWrapper>{explorePage(true)}</SplitExploreWrapper>
              <SplitFocusWrapper>{focusContent}</SplitFocusWrapper>
            </SplitParentWrapper>
          ) : (
            <SplitParentWrapper>
              <SplitExploreWrapper>{explorePage(false)}</SplitExploreWrapper>
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
