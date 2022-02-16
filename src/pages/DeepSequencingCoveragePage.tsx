import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import React, { useEffect } from 'react';
import { useExploreUrl } from '../helpers/explore-url';
import { makeLayout } from '../helpers/deep-page';
import { SequencingCoverageDeepExplore } from '../components/SequencingCoverageDeepExplore';
import { useQuery } from '../helpers/query-hook';
import { DatelessCountrylessCountSampleData } from '../data/sample/DatelessCountrylessCountSampleDataset';
import { DateCountSampleData } from '../data/sample/DateCountSampleDataset';
import { CaseCountAsyncDataset, CaseCountData } from '../data/CaseCountDataset';
import { useAsyncDataset } from '../helpers/use-async-dataset';
import { useSingleSelectorsFromExploreUrl } from '../helpers/selectors-from-explore-url-hook';
import { getLocation } from '../helpers/get-location';

export const DeepSequencingCoveragePage = () => {
  const exploreUrl = useExploreUrl();

  // Fetch data
  const { lsSelector, lSelector } = useSingleSelectorsFromExploreUrl(exploreUrl!);
  const wholeDatelessDataset = useQuery(
    signal => DatelessCountrylessCountSampleData.fromApi(lsSelector, signal),
    [lsSelector]
  );
  const wholeDateCountDataset = useQuery(
    signal => DateCountSampleData.fromApi(lsSelector, signal),
    [lsSelector]
  );
  const caseCountDataset: CaseCountAsyncDataset = useAsyncDataset(lSelector, ({ selector }, { signal }) =>
    CaseCountData.fromApi(selector, signal)
  );

  useEffect(() => {
    // Include the location of interest in the page title
    let place: string = getLocation(exploreUrl)
    document.title = `Sequencing coverage - ${place} - covSPECTRUM`;
  });

  if (!exploreUrl) {
    return null;
  }

  return makeLayout(
    <div className='ml-3'>
      <div className='flex'>
        <div className='flex-grow flex flex-row items-end space-x-2'>
          <h1>Sequencing coverage</h1>
        </div>
        <div>
          <Button className='mt-2' variant='secondary' as={Link} to={exploreUrl.getExplorePageUrl()}>
            Back to overview
          </Button>
        </div>
      </div>
    </div>,
    wholeDatelessDataset.data && wholeDateCountDataset.data && (
      <SequencingCoverageDeepExplore
        datelessCountDataset={wholeDatelessDataset.data}
        dateCountDataset={wholeDateCountDataset.data}
        caseCountDataset={caseCountDataset}
      />
    )
  );
};
