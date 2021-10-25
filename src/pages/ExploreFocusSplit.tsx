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
import { DetailedSampleAggDataset } from '../data/sample/DetailedSampleAggDataset';
import { CaseCountDataset } from '../data/CaseCountDataset';
import { DateCountSampleDataset } from '../data/sample/DateCountSampleDataset';
import { CountryDateCountSampleDataset } from '../data/sample/CountryDateCountSampleDataset';
import Loader from '../components/Loader';
import { useQuery } from '../helpers/query-hook';

interface Props {
  isSmallScreen: boolean;
}

export const ExploreFocusSplit = ({ isSmallScreen }: Props) => {
  const { validUrl, location, dateRange, variant, focusKey, setVariant } = useExploreUrl() ?? {
    validUrl: true,
  };

  const variantDataset = useQuery(
    signal => DetailedSampleAggDataset.fromApi({ location: location!, dateRange, variant }, signal),
    [dateRange, location, variant]
  );
  const wholeDatasetWithoutDateFilter = useQuery(
    // Used by the explore page
    signal => DetailedSampleAggDataset.fromApi({ location: location! }, signal),
    [location]
  );
  const wholeDateCountSampleDatasetWithoutDateFilter: DateCountSampleDataset | undefined = useMemo(() => {
    if (wholeDatasetWithoutDateFilter.isSuccess && wholeDatasetWithoutDateFilter.data) {
      return DateCountSampleDataset.fromDetailedSampleAggDataset(wholeDatasetWithoutDateFilter.data);
    }
  }, [wholeDatasetWithoutDateFilter.isSuccess, wholeDatasetWithoutDateFilter.data]);
  const wholeDatasetWithDateFilter = useQuery(
    // Used by the focus page
    signal => DetailedSampleAggDataset.fromApi({ location: location!, dateRange }, signal),
    [location]
  );
  const caseCountDataset = useQuery(signal => CaseCountDataset.fromApi({ location: location! }, signal), [
    location,
  ]);
  const wholeInternationalDateCountDataset = useQuery(
    signal => CountryDateCountSampleDataset.fromApi({ location: {}, dateRange }, signal),
    [dateRange]
  );
  const variantInternationalDateCountDataset = useQuery(
    signal => CountryDateCountSampleDataset.fromApi({ location: {}, dateRange, variant }, signal),
    [dateRange, variant]
  );

  const { path } = useRouteMatch();

  if (!validUrl) {
    // This may happen during a redirect
    return null;
  }

  const explorePage =
    caseCountDataset.isSuccess && wholeDateCountSampleDatasetWithoutDateFilter ? (
      <ExplorePage
        onVariantSelect={setVariant!}
        selection={variant}
        wholeDateCountSampleDataset={wholeDateCountSampleDatasetWithoutDateFilter}
        caseCountDataset={caseCountDataset.data!}
      />
    ) : (
      <Loader />
    );
  const deepExplorePage =
    caseCountDataset.isSuccess && wholeDatasetWithoutDateFilter.isSuccess ? (
      <DeepExplorePage
        wholeDataset={wholeDatasetWithoutDateFilter.data!}
        caseCountDataset={caseCountDataset.data!}
      />
    ) : (
      <Loader />
    );

  const makeLayout = (focusContent: React.ReactNode, deepFocusContent: React.ReactNode): JSX.Element => (
    <>
      <Switch>
        <Route exact path={`${path}`}>
          {isSmallScreen ? (
            <ScrollableFullContentWrapper>{explorePage}</ScrollableFullContentWrapper>
          ) : (
            <SplitParentWrapper>
              <SplitExploreWrapper>{explorePage}</SplitExploreWrapper>
              <SplitFocusWrapper>
                <FocusEmptyPage />
              </SplitFocusWrapper>
            </SplitParentWrapper>
          )}
        </Route>
        <Route exact path={`${path}/variants`}>
          {isSmallScreen ? (
            <ScrollableFullContentWrapper>{focusContent}</ScrollableFullContentWrapper>
          ) : (
            <SplitParentWrapper>
              <SplitExploreWrapper>{explorePage}</SplitExploreWrapper>
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
      wholeInternationalDateCountDataset.isSuccess &&
      caseCountDataset.isSuccess ? (
      <FocusPage
        key={focusKey}
        variantDataset={variantDataset.data!}
        wholeDataset={wholeDatasetWithDateFilter.data!}
        caseCountDataset={caseCountDataset.data!}
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
