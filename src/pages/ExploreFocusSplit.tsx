import React, { useMemo } from 'react';
import { AsyncState, PromiseFn, useAsync } from 'react-async';
import { Alert } from 'react-bootstrap';
import { Route, Switch, useHistory, useRouteMatch } from 'react-router';
import Loader from '../components/Loader';
import { ExploreWrapper, FocusWrapper, RawFullContentWrapper } from '../helpers/app-layout';
import { getFocusPageLink, useExploreUrl } from '../helpers/explore-url';
import { VariantSelector } from '../helpers/sample-selector';
import { SampleSetWithSelector } from '../helpers/sample-set';
import { DeepFocusPage } from '../pages/DeepFocusPage';
import { ExplorePage } from '../pages/ExplorePage';
import { FocusEmptyPage } from '../pages/FocusEmptyPage';
import { FocusPage } from '../pages/FocusPage';
import {
  DateRange,
  dateRangeToDates,
  getNewSamples,
  getSequencingIntensity,
  SamplingStrategy,
  toLiteralSamplingStrategy,
} from '../services/api';
import { Country } from '../services/api-types';
import dayjs from 'dayjs';
import { SequencingIntensityEntrySetWithSelector } from '../helpers/sequencing-intensity-entry-set';

// a promise which is never resolved or rejected
const waitForever = new Promise<never>(() => {});

function useVariantSampleSet({
  country,
  samplingStrategy,
  dateRange,
  variantSelector,
}: {
  country?: Country;
  samplingStrategy?: SamplingStrategy;
  dateRange?: DateRange;
  variantSelector?: VariantSelector;
}): AsyncState<SampleSetWithSelector> {
  const promiseFn = useMemo<PromiseFn<SampleSetWithSelector>>(
    () => async (options, { signal }) => {
      if (!samplingStrategy || !variantSelector || !dateRange) {
        // this result is never consumed since we do not use this sample set if these arguments are undefined
        return waitForever;
      }
      const { dateFrom, dateTo } = dateRangeToDates(dateRange);
      return getNewSamples(
        {
          country,
          matchPercentage: variantSelector.matchPercentage,
          mutations: variantSelector.variant.mutations,
          pangolinLineage: variantSelector.variant.name,
          dataType: toLiteralSamplingStrategy(samplingStrategy),
          dateFrom: dateFrom && dayjs(dateFrom).format('YYYY-MM-DD'),
          dateTo: dateTo && dayjs(dateTo).format('YYYY-MM-DD'),
        },
        signal
      );
    },
    [country, variantSelector, dateRange, samplingStrategy]
  );
  return useAsync(promiseFn);
}

function useWholeSampleSet({
  country,
  samplingStrategy,
  dateRange,
}: {
  country?: Country;
  samplingStrategy?: SamplingStrategy;
  dateRange?: DateRange;
}): AsyncState<SampleSetWithSelector> {
  const promiseFn = useMemo<PromiseFn<SampleSetWithSelector>>(
    () => async (options, { signal }) => {
      if (!samplingStrategy || !dateRange) {
        // this result is never consumed since we do not use this sample set if there is no samplingStrategy
        return waitForever;
      }
      const { dateFrom, dateTo } = dateRangeToDates(dateRange);
      return getNewSamples(
        {
          country,
          dataType: toLiteralSamplingStrategy(samplingStrategy),
          dateFrom: dateFrom && dayjs(dateFrom).format('YYYY-MM-DD'),
          dateTo: dateTo && dayjs(dateTo).format('YYYY-MM-DD'),
        },
        signal
      );
    },
    [country, samplingStrategy, dateRange]
  );
  return useAsync(promiseFn);
}

function useSequencingIntensityEntrySet({ country }: { country: string | undefined }) {
  const promiseFn = useMemo<PromiseFn<SequencingIntensityEntrySetWithSelector>>(
    () => async (options, { signal }) => {
      return getSequencingIntensity({ country }, signal);
    },
    [country]
  );
  return useAsync(promiseFn);
}

interface Props {
  isSmallScreen: boolean;
}

export const ExploreFocusSplit = ({ isSmallScreen }: Props) => {
  const { country, samplingStrategy, dateRange, variantSelector, focusKey } = useExploreUrl() || {};

  const variantSampleSetState = useVariantSampleSet({
    country,
    samplingStrategy,
    dateRange,
    variantSelector,
  });
  const wholeSampleSetState = useWholeSampleSet({ country, samplingStrategy, dateRange });
  const variantInternationalSampleSetState = useVariantSampleSet({
    samplingStrategy,
    dateRange,
    variantSelector,
  });
  const wholeInternationalSampleSetState = useWholeSampleSet({ samplingStrategy, dateRange });
  const sequencingIntensityEntrySetState = useSequencingIntensityEntrySet({ country });

  const { path } = useRouteMatch();

  const history = useHistory();

  if (!country || !samplingStrategy || !dateRange) {
    // This may happen during a redirect
    return null;
  }

  let explorePage: React.ReactNode;
  if (
    sequencingIntensityEntrySetState.status === 'initial' ||
    sequencingIntensityEntrySetState.status === 'pending'
  ) {
    explorePage = <Loader />;
  } else if (sequencingIntensityEntrySetState.status === 'rejected') {
    explorePage = <Alert variant='danger'>Failed to load data</Alert>;
  } else {
    explorePage = (
      <ExplorePage
        country={country}
        samplingStrategy={samplingStrategy}
        dateRange={dateRange}
        onVariantSelect={variantSelector =>
          history.push(getFocusPageLink({ variantSelector, country, samplingStrategy, dateRange }))
        }
        selection={variantSelector}
        wholeSampleSetState={wholeSampleSetState}
        sequencingIntensityEntrySet={sequencingIntensityEntrySetState.data}
      />
    );
  }

  const makeLayout = (focusContent: React.ReactNode, deepFocusContent: React.ReactNode): JSX.Element => (
    <>
      <Switch>
        <Route exact path={`${path}`}>
          {isSmallScreen ? (
            <RawFullContentWrapper>{explorePage}</RawFullContentWrapper>
          ) : (
            <>
              <ExploreWrapper>{explorePage}</ExploreWrapper>
              <FocusWrapper>
                <FocusEmptyPage />
              </FocusWrapper>
            </>
          )}
        </Route>
        <Route exact path={`${path}/variants/:variantSelector`}>
          {isSmallScreen ? (
            <RawFullContentWrapper>{focusContent}</RawFullContentWrapper>
          ) : (
            <>
              <ExploreWrapper>{explorePage}</ExploreWrapper>
              <FocusWrapper>{focusContent}</FocusWrapper>
            </>
          )}
        </Route>
        <Route path={`${path}/variants/:variantSelector`}>
          <RawFullContentWrapper>{deepFocusContent}</RawFullContentWrapper>
        </Route>
      </Switch>
    </>
  );

  if (
    variantSampleSetState.status === 'initial' ||
    variantSampleSetState.status === 'pending' ||
    wholeSampleSetState.status === 'initial' ||
    wholeSampleSetState.status === 'pending' ||
    sequencingIntensityEntrySetState.status === 'initial' ||
    sequencingIntensityEntrySetState.status === 'pending'
  ) {
    return makeLayout(<Loader />, <Loader />);
  }

  if (
    variantSampleSetState.status === 'rejected' ||
    wholeSampleSetState.status === 'rejected' ||
    sequencingIntensityEntrySetState.status === 'rejected'
  ) {
    const alert = <Alert variant='danger'>Failed to load samples</Alert>;
    return makeLayout(alert, alert);
  }

  return makeLayout(
    variantSelector && (
      <FocusPage
        {...variantSelector}
        key={focusKey}
        country={country}
        samplingStrategy={samplingStrategy}
        dateRange={dateRange}
        variantSampleSet={variantSampleSetState.data}
        wholeSampleSet={wholeSampleSetState.data}
        variantInternationalSampleSetState={variantInternationalSampleSetState}
        wholeInternationalSampleSetState={wholeInternationalSampleSetState}
        sequencingIntensityEntrySet={sequencingIntensityEntrySetState.data}
      />
    ),
    variantSelector && (
      <DeepFocusPage
        {...variantSelector}
        key={focusKey}
        country={country}
        samplingStrategy={samplingStrategy}
        dateRange={dateRange}
        variantSampleSet={variantSampleSetState.data}
        wholeSampleSet={wholeSampleSetState.data}
        variantInternationalSampleSetState={variantInternationalSampleSetState}
        wholeInternationalSampleSetState={wholeInternationalSampleSetState}
      />
    )
  );
};
