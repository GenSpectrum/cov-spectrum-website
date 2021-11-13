import { DeepRoute, makeLayout, makeSwitch } from '../helpers/deep-page';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import React from 'react';
import { Route, useRouteMatch } from 'react-router';
import { SequencingCoverageDeepExplore } from '../components/SequencingCoverageDeepExplore';
import { DetailedSampleAggDataset } from '../data/sample/DetailedSampleAggDataset';
import { useExploreUrl } from '../helpers/explore-url';
import { CaseCountAsyncDataset } from '../data/CaseCountDataset';

interface Props {
  wholeDataset: DetailedSampleAggDataset;
  caseCountDataset: CaseCountAsyncDataset;
}

const routes: DeepRoute<Props>[] = [
  {
    key: 'sequencing-coverage',
    title: 'Sequencing Coverage',
    content: props => (
      <SequencingCoverageDeepExplore
        wholeDataset={props.wholeDataset}
        caseCountDataset={props.caseCountDataset}
      />
    ),
  },
];

export const DeepExplorePage = (props: Props) => {
  const { path } = useRouteMatch();
  const overviewPageUrl = useExploreUrl()?.getOverviewPageUrl() ?? '#';
  const _makeLayout = (content: JSX.Element) =>
    makeLayout(
      <div className='ml-3'>
        <div className='flex'>
          <div className='flex-grow flex flex-row items-end space-x-2'>
            <h1>
              {routes.map(route => (
                <Route key={route.key} path={`${path}/${route.key}`}>
                  {route.title}
                </Route>
              ))}
            </h1>
            {/*{props.dateRange && <DateRangeSelector dateRange={props.dateRange} />} */}
            {/*TODO*/}
          </div>
          <div>
            <Button className='mt-2' variant='secondary' as={Link} to={overviewPageUrl}>
              Back to overview
            </Button>
          </div>
        </div>
      </div>,
      content
    );
  return _makeLayout(makeSwitch(routes, props, path));
};
