import React, { useMemo } from 'react';
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
import { CaseCountData, CaseCountDataset } from '../data/CaseCountDataset';
import { DateCountSampleData, DateCountSampleDataset } from '../data/sample/DateCountSampleDataset';
import { CountryDateCountSampleData } from '../data/sample/CountryDateCountSampleDataset';
import Loader from '../components/Loader';
import { useQuery } from '../helpers/query-hook';
import { PromiseFn, useAsync } from 'react-async';
import { LocationDateSelector } from '../data/LocationDateSelector';
import { useDeepCompareMemo } from '../helpers/deep-compare-hooks';

interface Props {
  isSmallScreen: boolean;
}

type PromiseFnWithSelector<T, S> = {
  selector: T;
  promiseFn: PromiseFn<S>;
};

export const ExploreFocusSplit = ({ isSmallScreen }: Props) => {
  const { validUrl, location, dateRange, variant, focusKey, setVariant } = useExploreUrl() ?? {
    validUrl: true,
  };

  const variantDataset = useQuery(
    signal => DetailedSampleAggData.fromApi({ location: location!, dateRange, variant }, signal),
    [dateRange, location, variant]
  );
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

  const { promiseFn: caseCountPromiseFn, selector: caseCountSelector } = useDeepCompareMemo<
    PromiseFnWithSelector<LocationDateSelector, CaseCountDataset>
  >(() => {
    const selector = { location: location! };
    return {
      selector,
      promiseFn: (_, { signal }) => CaseCountData.fromApi(selector, signal),
    };
  }, [location]);
  const caseCountDatasetAsync = useAsync(caseCountPromiseFn);
  const caseCountDataset = useMemo(
    () => ({
      selector: caseCountSelector,
      payload: caseCountDatasetAsync.data?.payload,
      status: caseCountDatasetAsync.status,
    }),
    [caseCountDatasetAsync.data, caseCountDatasetAsync.status, caseCountSelector]
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
    variant &&
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
    ),
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
