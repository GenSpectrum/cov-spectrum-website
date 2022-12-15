import { useExploreUrl } from '../helpers/explore-url';
import { AnalysisMode } from '../data/AnalysisMode';
import { FocusSinglePage } from './FocusSinglePage';
import { SplitExploreWrapper, SplitFocusWrapper, SplitParentWrapper } from '../helpers/app-layout';
import { KnownVariantsList } from '../components/KnownVariantsList/KnownVariantsList';
import Loader from '../components/Loader';
import React, { useEffect } from 'react';
import { useQuery } from '../helpers/query-hook';
import { DateCountSampleData } from '../data/sample/DateCountSampleDataset';
import { useSingleSelectorsFromExploreUrl } from '../helpers/selectors-from-explore-url-hook';
import { InternalLink } from '../components/InternalLink';
import { VariantSearch } from '../components/VariantSearch';
import { FocusCompareEqualsPage } from './FocusCompareEqualsPage';
import { FocusCompareToBaselinePage } from './FocusCompareToBaselinePage';
import { getLocation } from '../helpers/get-location';
import { formatVariantDisplayName } from '../data/VariantSelector';
import DateRangePickerNew from '../components/DateRangePicker';
import { FixedDateRangeSelector } from '../data/DateRangeSelector';

type Props = {
  isSmallScreen: boolean;
};

export const FocusPage = ({ isSmallScreen }: Props) => {
  const exploreUrl = useExploreUrl()!;

  // fetch data
  const { lsSelector, hostAndQc } = useSingleSelectorsFromExploreUrl(exploreUrl);
  const wholeDateCountWithoutDateFilter = useQuery(
    signal => DateCountSampleData.fromApi(lsSelector, signal),
    [lsSelector]
  );

  let subFocusPage: JSX.Element;
  switch (exploreUrl.analysisMode) {
    case AnalysisMode.Single:
      subFocusPage = <FocusSinglePage />;
      break;
    case AnalysisMode.CompareEquals:
      subFocusPage = <FocusCompareEqualsPage />;
      break;
    case AnalysisMode.CompareToBaseline:
      subFocusPage = <FocusCompareToBaselinePage />;
      break;
    default:
      throw new Error('Unexpected or undefined analysis mode: ' + exploreUrl.analysisMode);
  }

  useEffect(() => {
    // Include the variant name and location of interest in the page title
    let variant = formatVariantDisplayName(exploreUrl.variants![0]);
    let place: string = getLocation(exploreUrl);
    document.title = `${variant} - ${place} - covSPECTRUM`;
  });

  const onChangeDate = (dateRangeSelector: FixedDateRangeSelector) => {
    exploreUrl?.setDateRange(dateRangeSelector);
  };

  return (
    <>
      <SplitParentWrapper>
        {/* Known variant selection */}
        <SplitExploreWrapper>
          {wholeDateCountWithoutDateFilter.data ? (
            <div id='explore-selectors'>
              <KnownVariantsList
                onVariantSelect={exploreUrl.setVariants}
                wholeDateCountSampleDataset={wholeDateCountWithoutDateFilter.data}
                variantSelector={exploreUrl.variants}
                hostAndQc={hostAndQc}
                isHorizontal={isSmallScreen}
                isLandingPage={false}
              />
            </div>
          ) : (
            <Loader />
          )}
        </SplitExploreWrapper>
        <SplitFocusWrapper>
          {/* Analysis mode */}
          <div>
            <span
              className={getAnalysisModeClass(exploreUrl.analysisMode, AnalysisMode.Single)}
              onClick={() => exploreUrl.setAnalysisMode(AnalysisMode.Single)}
            >
              Analyze single variant
            </span>{' '}
            |{' '}
            <span
              className={getAnalysisModeClass(exploreUrl.analysisMode, AnalysisMode.CompareEquals)}
              onClick={() => exploreUrl.setAnalysisMode(AnalysisMode.CompareEquals)}
            >
              Compare variants
            </span>{' '}
            |{' '}
            <span
              className={getAnalysisModeClass(exploreUrl.analysisMode, AnalysisMode.CompareToBaseline)}
              onClick={() => exploreUrl.setAnalysisMode(AnalysisMode.CompareToBaseline)}
            >
              Compare variants to a baseline
            </span>
          </div>
          {/* Search bar */}
          {!isSmallScreen && (
            <div className='text-sm mb-2'>
              <p>
                Search for Pango lineages, Nextstrain clades, AA and nucleotide substitutions, deletions, and
                🌟 <b>insertions</b> 🌟 (
                <InternalLink path='/about#faq-search-variants'>see documentation</InternalLink>):
              </p>
            </div>
          )}
          <div
            id='variant-search-bar'
            className={`flex ${
              exploreUrl.analysisMode === 'CompareToBaseline' || exploreUrl.analysisMode === 'CompareEquals'
                ? 'flex-column'
                : 'flex-row'
            }  flex-wrap w-full`}
          >
            <div className='m-1'>
              <DateRangePickerNew dateRangeSelector={exploreUrl.dateRange} onChangeDate={onChangeDate} />
            </div>
            <div className='flex-grow'>
              <VariantSearch
                onVariantSelect={exploreUrl.setVariants}
                currentSelection={exploreUrl.variants}
                analysisMode={exploreUrl.analysisMode}
              />
            </div>
          </div>
          {/* Main content */}
          {subFocusPage}
        </SplitFocusWrapper>
      </SplitParentWrapper>
    </>
  );
};

function getAnalysisModeClass(current: AnalysisMode, thisOne: AnalysisMode): string {
  return current === thisOne ? 'font-bold' : 'underline cursor-pointer';
}
