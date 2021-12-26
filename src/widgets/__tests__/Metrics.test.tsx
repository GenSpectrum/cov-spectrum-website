import React from 'react';
import renderer from 'react-test-renderer';
import Metric from '../Metrics';
import { maskUuid } from '../../helpers/snapshot-tests-masking';

describe('<Metric>', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create(<Metric title='Proportion' value={0.59} helpText='This is the proportion of something.' />)
      .toJSON();
    maskUuid(tree);
    expect(tree).toMatchSnapshot();
  });
});
