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
import { DateRangePicker } from '../components/DateRangePicker';
import { VariantSearch } from '../components/VariantSearch';
import { FocusCompareEqualsPage } from './FocusCompareEqualsPage';
import { FocusCompareToBaselinePage } from './FocusCompareToBaselinePage';
import { getLocation } from '../helpers/get-location';

type Props = {
  isSmallScreen: boolean;
};

export const FocusPage = ({ isSmallScreen }: Props) => {
  const exploreUrl = useExploreUrl()!;

  // fetch data
  const { lsSelector } = useSingleSelectorsFromExploreUrl(exploreUrl);
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
    let variantObj = typeof exploreUrl.variants == 'object' ? exploreUrl.variants[0] : {};
    let variant = 'pangoLineage' in variantObj ? variantObj['pangoLineage'] : 'Variant';
    let place: string = getLocation(exploreUrl);
    document.title = `${variant} - ${place} - covSPECTRUM`;
  });

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
