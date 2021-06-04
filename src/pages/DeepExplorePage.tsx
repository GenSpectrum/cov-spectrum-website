import { Country } from '../services/api-types';
import { DateRange, SamplingStrategy } from '../services/api';
import { DeepRoute, makeLayout, makeSwitch } from '../helpers/deep-page';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import React from 'react';
import { useRouteMatch } from 'react-router';

interface Props {
  country: Country;
  dateRange: DateRange;
  samplingStrategy: SamplingStrategy;
}

const routes: DeepRoute<Props>[] = [];

export const DeepExplorePage = (props: Props) => {
  const { path, url } = useRouteMatch();
  const _makeLayout = (content: JSX.Element) =>
    makeLayout(
      <Button className='mt-2' variant='secondary' as={Link} to={url}>
        Back to overview
      </Button>,
      content
    );
  return _makeLayout(makeSwitch(routes, props, path));
};
