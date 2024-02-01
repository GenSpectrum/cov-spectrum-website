import React, { useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Header from './Header';
import { LoginWrapper } from './helpers/app-layout';
import { AboutPage } from './pages/AboutPage';
import { LoginPage } from './pages/LoginPage';
import { useResizeDetector } from 'react-resize-detector';
import { Alert, AlertVariant } from './helpers/ui';
import { StoryOverviewPage } from './pages/StoryOverviewPage';
import { WasteWaterStoryPage } from './models/wasteWater/story/WasteWaterStoryPage';
import { WasteWaterLocationPage } from './models/wasteWater/story/WasteWaterLocationPage';
import StoriesOverview from './stories/StoriesOverview';
import StoryRouter from './stories/StoryRouter';
import { useExploreUrl } from './helpers/explore-url';
import { fetchNextcladeDatasetInfo, fetchLapisDataVersion } from './data/api-lapis';
import { sequenceDataSource } from './helpers/sequence-data-source';
import { ExternalLink } from './components/ExternalLink';
import styled from 'styled-components';
import { ExplorePage } from './pages/ExplorePage';
import { DeepInternationalComparisonPage } from './pages/DeepInternationalComparisonPage';
import { DeepChen2021FitnessPage } from './pages/DeepChen2021FitnessPage';
import { DeepHospitalizationDeathPage } from './pages/DeepHospitalizationDeathPage';
import { DeepWastewaterPage } from './pages/DeepWastewaterPage';
import { DeepSequencingCoveragePage } from './pages/DeepSequencingCoveragePage';
import { FocusPage } from './pages/FocusPage';
import { formatQcSelectorAsString, isDefaultQcSelector } from './data/QcSelector';
import { isDefaultHostSelector } from './data/HostSelector';
import { FaFilter } from 'react-icons/fa';
import { CollectionOverviewPage } from './pages/CollectionOverviewPage';
import { CollectionAddPage } from './pages/CollectionAddPage';
import { CollectionSinglePage } from './pages/CollectionSinglePage';
import {
  defaultSubmissionDateRangeSelector,
  formatDateRangeSelector,
  isDefaultSubmissionDateRangeSelector,
} from './data/DateRangeSelector';
import { NewFocusPage } from './pages/NewFocusPage';
import { useQuery } from './helpers/query-hook';
import { defaultDateRange, defaultHost, defaultSamplingStrategy } from './data/default-selectors';
import { useBaseLocation } from './helpers/use-base-location';
import { ChatPage } from './pages/ChatPage';
import { NextcladeDatasetInfo } from './data/NextcladeDatasetInfo';
import Loader from './components/Loader';
import { FixedChatButton } from './components/chat/FixedChatButton';

const isPreview = !!process.env.REACT_APP_IS_VERCEL_DEPLOYMENT;

const FooterStyle = styled.footer`
  margin-top: 50px;
  padding-top: 20px;
  border-top: 1px solid darkgray;
  font-size: small;
`;

export const App = () => {
  const [hideHeaderAndFooter, setHideHeaderAndFooter] = useState(false);
  const { width, ref } = useResizeDetector<HTMLDivElement>();
  const isSmallScreen = width !== undefined && width < 768;

    const queryFunction =
      sequenceDataSource === 'gisaid'
        ? fetchNextcladeDatasetInfo
        : () => {
            return Promise.resolve({ name: 'notNextcladeDatasetInfo', tag: null } as NextcladeDatasetInfo);
          };

    const nextcladeDatasetInfo = useQuery(queryFunction, []).data;

  const { data: lapisDataVersion } = useQuery(() => fetchLapisDataVersion(), []);

  const isChatPage = useLocation().pathname === '/chat';
  const showFooter = !hideHeaderAndFooter && !isChatPage;

  return (
    <div className='w-full'>
      {!hideHeaderAndFooter && <Header />}
      <div ref={ref} className='w-full'>
        <MainContent
          isSmallScreen={isSmallScreen}
          hideHeaderAndFooter={hideHeaderAndFooter}
          setHideHeaderAndFooter={setHideHeaderAndFooter}
        />
      </div>
      {showFooter && (
        <Footer nextcladeDatasetInfo={nextcladeDatasetInfo} lapisDataVersion={lapisDataVersion} />
      )}
      {!isSmallScreen && !isChatPage && <FixedChatButton />}
    </div>
  );
};

type MainContentProps = {
  isSmallScreen: boolean;
  hideHeaderAndFooter: boolean;
  setHideHeaderAndFooter: (value: ((prevState: boolean) => boolean) | boolean) => void;
};

function MainContent({ isSmallScreen, hideHeaderAndFooter, setHideHeaderAndFooter }: MainContentProps) {
  const baseLocation = useBaseLocation();
  if (!baseLocation) {
    return <Loader />; // Just wait a slight bit. It should come very soon!
  }

  return (
    <>
      {isPreview && <PreviewAlert />}
      <AdvancedFiltersAlert />
      <CovSpectrumRoutes
        baseLocation={baseLocation}
        isSmallScreen={isSmallScreen}
        hideHeaderAndFooter={hideHeaderAndFooter}
        setHideHeaderAndFooter={setHideHeaderAndFooter}
      />
    </>
  );
}

function PreviewAlert() {
  return (
    <Alert variant={AlertVariant.WARNING}>
      <div className='text-center font-bold'>
        Note: This is a preview deployment. Please visit{' '}
        <a href='https://cov-spectrum.org'>https://cov-spectrum.org</a> for the official website.
      </div>
    </Alert>
  );
}

function AdvancedFiltersAlert() {
  const { host, qc, setHostAndQc, submissionDate } = useExploreUrl() ?? {};

  if (!(host && qc && submissionDate && setHostAndQc)) {
    return <></>;
  }

  let allFiltersHaveTheirDefaultValue =
    isDefaultHostSelector(host) &&
    isDefaultQcSelector(qc) &&
    isDefaultSubmissionDateRangeSelector(submissionDate);

  if (allFiltersHaveTheirDefaultValue) {
    return <></>;
  }

  return (
    <Alert variant={AlertVariant.WARNING}>
      <div className='flex flex-row'>
        <FaFilter
          className='m-1'
          style={{ width: '30px', minWidth: '30px', height: '30px', minHeight: '30px' }}
        />
        <div className='ml-4 flex-grow-1'>
          <div className='font-weight-bold'>Advanced filters are active</div>
          {!isDefaultHostSelector(host) && <div>Selected hosts: {host.join(', ')}</div>}
          {!isDefaultQcSelector(qc) && <div>Sequence quality: {formatQcSelectorAsString(qc)}</div>}
          {!isDefaultSubmissionDateRangeSelector(submissionDate) && (
            <div>Submission date: {formatDateRangeSelector(submissionDate)}</div>
          )}

          <div className='mt-4'>
            <button
              className='underline cursor-pointer'
              onClick={() => setHostAndQc(defaultHost, {}, defaultSubmissionDateRangeSelector)}
            >
              Remove filters
            </button>
          </div>
        </div>
      </div>
    </Alert>
  );
}

type CovSpectrumRoutesProps = {
  baseLocation: string;
  isSmallScreen: boolean;
  hideHeaderAndFooter: boolean;
  setHideHeaderAndFooter: (value: ((prevState: boolean) => boolean) | boolean) => void;
};

function CovSpectrumRoutes({
  baseLocation,
  isSmallScreen,
  hideHeaderAndFooter,
  setHideHeaderAndFooter,
}: CovSpectrumRoutesProps) {
  return (
    <Routes>
      <Route
        path='/'
        element={
          <Navigate replace to={`/explore/${baseLocation}/${defaultSamplingStrategy}/${defaultDateRange}`} />
        }
      />
      <Route
        path='/login'
        element={
          <LoginWrapper>
            <LoginPage />
          </LoginWrapper>
        }
      />
      <Route
        path='/explore/:country/:samplingStrategy/:dateRange'
        element={<ExplorePage isSmallScreen={isSmallScreen} />}
      />
      <Route
        path='/explore/:country/:samplingStrategy/:dateRange/sequencing-coverage'
        element={<DeepSequencingCoveragePage />}
      />
      <Route
        path='/explore/:country/:samplingStrategy/:dateRange/variants'
        element={<FocusPage isSmallScreen={isSmallScreen} />}
      />
      <Route
        path='/explore/:country/:samplingStrategy/:dateRange/variants/international-comparison'
        element={<DeepInternationalComparisonPage />}
      />
      <Route
        path='/explore/:country/:samplingStrategy/:dateRange/variants/hospitalization-death'
        element={<DeepHospitalizationDeathPage />}
      />
      <Route
        path='/explore/:country/:samplingStrategy/:dateRange/variants/waste-water'
        element={<DeepWastewaterPage />}
      />
      <Route
        path='/explore/:country/:samplingStrategy/:dateRange/variants/chen-2021-fitness'
        element={<DeepChen2021FitnessPage />}
      />
      <Route path='/story' element={<StoryOverviewPage />} />
      <Route path='/story/wastewater-in-switzerland' element={<WasteWaterStoryPage />} />
      <Route path='/stories/wastewater-in-switzerland' element={<WasteWaterStoryPage />} />
      <Route
        path='/story/wastewater-in-switzerland/location/:location'
        element={<WasteWaterLocationPage />}
      />
      <Route
        path='/stories/wastewater-in-switzerland/location/:location'
        element={<WasteWaterLocationPage />}
      />
      <Route path='/stories' element={<StoriesOverview />} />
      <Route path='/stories/:storyId' element={<StoryRouter />} />
      <Route path='/collections' element={<CollectionOverviewPage />} />
      <Route path='/collections/add' element={<CollectionAddPage />} />
      <Route path='/collections/:collectionId' element={<CollectionSinglePage />} />
      <Route
        path='/focus'
        element={
          <NewFocusPage fullScreenMode={hideHeaderAndFooter} setFullScreenMode={setHideHeaderAndFooter} />
        }
      />
      <Route path='/about' element={<AboutPage />} />
      <Route path='/chat' element={<ChatPage />} />
    </Routes>
  );
}

function Footer({
  nextcladeDatasetInfo,
  lapisDataVersion,
}: {
  nextcladeDatasetInfo?: NextcladeDatasetInfo;
  lapisDataVersion?: string;
}) {
  return (
    <FooterStyle className='text-center'>
      {lapisDataVersion && <div>The sequence data was updated: {lapisDataVersion}</div>}
      {nextcladeDatasetInfo?.tag && <div>Nextclade dataset version: {nextcladeDatasetInfo.tag}</div>}
      {sequenceDataSource === 'gisaid' && (
        <div>
          Data obtained from GISAID that is used in this Web Application remain subject to GISAID’s{' '}
          <ExternalLink url='http://gisaid.org/daa'>Terms and Conditions</ExternalLink>.
        </div>
      )}
      <div className='flex flex-wrap justify-center items-center gap-x-8 gap-y-4 my-4 mt-8 px-2'>
        <ExternalLink url='https://ethz.ch'>
          <img className='h-5' alt='ETH Zurich' src='/img/ethz.png' />
        </ExternalLink>
        <ExternalLink url='https://bsse.ethz.ch/cevo'>
          <img className='h-7' alt='Computational Evolution Group' src='/img/cEvo.png' />
        </ExternalLink>
        <ExternalLink url='https://www.sib.swiss/'>
          <img className='h-7' alt='SIB Swiss Institute of Bioinformatics' src='/img/sib.svg' />
        </ExternalLink>
        <ExternalLink url='https://vercel.com/?utm_source=cov-spectrum&utm_campaign=oss'>
          <img className='h-6' alt='Powered by Vercel' src='/img/powered-by-vercel.svg' />
        </ExternalLink>
      </div>
    </FooterStyle>
  );
}
