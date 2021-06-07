import React, { useEffect, useMemo, useState } from 'react';
import { AsyncState, PromiseFn, useAsync } from 'react-async';
import { Button, Modal } from 'react-bootstrap';
import { Route, Switch, useHistory, useRouteMatch } from 'react-router';
import Loader from '../components/Loader';
import {
  SplitExploreWrapper,
  SplitFocusWrapper,
  RawFullContentWrapper,
  ScrollableFullContentWrapper,
  SplitParentWrapper,
} from '../helpers/app-layout';
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
  getDataStatus,
  getNewSamples,
  getSequencingIntensity,
  SamplingStrategy,
  toLiteralSamplingStrategy,
} from '../services/api';
import { Country } from '../services/api-types';
import dayjs from 'dayjs';
import { SequencingIntensityEntrySetWithSelector } from '../helpers/sequencing-intensity-entry-set';
import { Alert, AlertVariant } from '../helpers/ui';
import { DeepExplorePage } from './DeepExplorePage';

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

function useSequencingIntensityEntrySet({
  country,
  samplingStrategy,
}: {
  country: string | undefined;
  samplingStrategy?: SamplingStrategy;
}) {
  const promiseFn = useMemo<PromiseFn<SequencingIntensityEntrySetWithSelector>>(
    () => async (options, { signal }) => {
      return getSequencingIntensity(
        {
          country,
          samplingStrategy: samplingStrategy ? toLiteralSamplingStrategy(samplingStrategy) : undefined,
        },
        signal
      );
    },
    [country, samplingStrategy]
  );
  return useAsync(promiseFn);
}

interface Props {
  isSmallScreen: boolean;
}

const pageLoadedTimestamp = dayjs();

export const ExploreFocusSplit = ({ isSmallScreen }: Props) => {
  const { country, samplingStrategy, dateRange, variantSelector, focusKey } = useExploreUrl() || {};
  const [dataOutdated, setDataOutdated] = useState(false);

  // Check every 4 seconds whether we have new data and ask the user to refresh the page if that's the case.
  useEffect(() => {
    const interval = setInterval(() => {
      getDataStatus().then(dataStatus => {
        if (dayjs.utc(dataStatus.lastUpdateTimestamp).isAfter(pageLoadedTimestamp)) {
          setDataOutdated(true);
          clearInterval(interval);
        }
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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
  const sequencingIntensityEntrySetState = useSequencingIntensityEntrySet({ country, samplingStrategy });

  const { path } = useRouteMatch();

  const history = useHistory();

  if (!country || !samplingStrategy || !dateRange) {
    // This may happen during a redirect
    return null;
  }

  let explorePage: React.ReactNode;
  let deepExplorePage: React.ReactNode;
  if (
    sequencingIntensityEntrySetState.status === 'initial' ||
    sequencingIntensityEntrySetState.status === 'pending'
  ) {
    explorePage = <Loader />;
    deepExplorePage = <Loader />;
  } else if (sequencingIntensityEntrySetState.status === 'rejected') {
    explorePage = <Alert variant={AlertVariant.DANGER}>Failed to load data</Alert>;
    deepExplorePage = <Alert variant={AlertVariant.DANGER}>Failed to load data</Alert>;
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
    deepExplorePage = (
      <DeepExplorePage
        country={country}
        dateRange={dateRange}
        samplingStrategy={samplingStrategy}
        sequencingIntensityEntrySet={sequencingIntensityEntrySetState.data}
      />
    );
  }

  const makeLayout = (focusContent: React.ReactNode, deepFocusContent: React.ReactNode): JSX.Element => (
    <>
      <Modal show={dataOutdated} backdrop='static' keyboard={false}>
        <Modal.Body>
          <b>Good news - we have updated data! Please reload the page.</b>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='primary' style={{ width: '100%' }} onClick={() => window.location.reload()}>
            Reload
          </Button>
        </Modal.Footer>
      </Modal>
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
        <Route exact path={`${path}/variants/:variantSelector`}>
          {isSmallScreen ? (
            <ScrollableFullContentWrapper>{focusContent}</ScrollableFullContentWrapper>
          ) : (
            <SplitParentWrapper>
              <SplitExploreWrapper>{explorePage}</SplitExploreWrapper>
              <SplitFocusWrapper>{focusContent}</SplitFocusWrapper>
            </SplitParentWrapper>
          )}
        </Route>
        <Route path={`${path}/variants/:variantSelector`}>
          <RawFullContentWrapper>{deepFocusContent}</RawFullContentWrapper>
        </Route>
        <Route path={`${path}`}>
          <RawFullContentWrapper>{deepExplorePage}</RawFullContentWrapper>
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
    const alert = <Alert variant={AlertVariant.DANGER}>Failed to load samples</Alert>;
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
