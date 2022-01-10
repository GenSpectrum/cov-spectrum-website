import { useExploreUrl } from '../helpers/explore-url';
import { AnalysisMode } from '../data/AnalysisMode';
import { FocusSinglePage } from './FocusSinglePage';
import { SplitExploreWrapper, SplitFocusWrapper, SplitParentWrapper } from '../helpers/app-layout';
import { KnownVariantsList } from '../components/KnownVariantsList/KnownVariantsList';
import Loader from '../components/Loader';
import React from 'react';
import { useQuery } from '../helpers/query-hook';
import { DateCountSampleData } from '../data/sample/DateCountSampleDataset';
import { useSelectorsFromExploreUrl } from '../helpers/selectors-from-explore-url-hook';
import { InternalLink } from '../components/InternalLink';
import { DateRangePicker } from '../components/DateRangePicker';
import { VariantSearch } from '../components/VariantSearch';

type Props = {
  isSmallScreen: boolean;
};

export const FocusPage = ({ isSmallScreen }: Props) => {
  const exploreUrl = useExploreUrl()!;

  // fetch data
  const { lsSelector } = useSelectorsFromExploreUrl(exploreUrl);
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
      subFocusPage = <>Compare equals</>;
      break;
    case AnalysisMode.CompareToBaseline:
      subFocusPage = <>Compare to baseline</>;
      break;
    default:
      throw new Error('Unexpected or undefined analysis mode: ' + exploreUrl.analysisMode);
  }
  return (
    <>
      <SplitParentWrapper>
        {/* Known variant selection */}
        <SplitExploreWrapper>
          {wholeDateCountWithoutDateFilter.data ? (
            <div id='explore-selectors'>
              <KnownVariantsList
                onVariantSelect={exploreUrl.setVariant}
                wholeDateCountSampleDataset={wholeDateCountWithoutDateFilter.data}
                variantSelector={exploreUrl.variants}
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
                Search for pango lineages, amino acid mutations, and nucleotide mutations (
                <InternalLink path='/about#faq-search-variants'>see documentation</InternalLink>):
              </p>
            </div>
          )}
          <div id='variant-search-bar' className='flex flex-row flex-wrap m-1'>
            <div className='m-1'>
              <DateRangePicker dateRangeSelector={exploreUrl.dateRange} />
            </div>
            <div className='m-1 flex-grow'>
              <VariantSearch
                onVariantSelect={exploreUrl.setVariant}
                currentSelection={exploreUrl.variant}
                isSimple={isSmallScreen}
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
