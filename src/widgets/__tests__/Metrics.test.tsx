import React from 'react';
import renderer from 'react-test-renderer';
import Metric from '../Metrics';
import { maskUuid } from '../../helpers/testing/snapshot-tests-masking';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('<Metric>', () => {
  it('renders correctly', () => {
    const tree = renderer
      .create(<Metric title='Proportion' value={0.59} helpText='This is the proportion of something.' />)
      .toJSON();
    maskUuid(tree);
    expect(tree).toMatchSnapshot();
  });

  test('should show value and title of metric without percent', () => {
    const title = 'TestTitle';
    const testHelpText = 'TestHelpText';
    const value = 1234;
    render(<Metric value={value} title={title} helpText={testHelpText} />);

    expect(screen.getByText(value.toString())).toBeInTheDocument();
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.queryByText('1234%')).toBeNull();
  });

  test('should show percentage of value alongside value if requested', () => {
    const title = 'TestTitle';
    const testHelpText = 'TestHelpText';
    const value = 1234;
    render(<Metric value={value} title={title} helpText={testHelpText} showPercent={0.5678} />);

    expect(screen.getByText(value.toString())).toBeInTheDocument();
    expect(screen.getByText('0.5678%')).toBeInTheDocument();
  });

  test('should show percent sign after value if requested', () => {
    const title = 'TestTitle';
    const testHelpText = 'TestHelpText';
    const value = 0.1234;
    render(<Metric value={value} title={title} helpText={testHelpText} percent={true} />);

    expect(screen.queryByText(value.toString())).toBeNull();
    expect(screen.getByText('0.1234%')).toBeInTheDocument();
  });

  test('should show tooltip on hover', async () => {
    const title = 'TestTitle';
    const testHelpText = 'TestHelpText';
    const value = 0.1234;
    render(<Metric value={value} title={title} helpText={testHelpText} />);

    expect(screen.queryByRole('tooltip')).toBeNull();

    const info = screen.getByLabelText('TestHelpText');
    await userEvent.hover(info, { delay: 500 });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });
});
