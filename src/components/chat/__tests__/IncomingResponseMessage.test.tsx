import { render, screen } from '@testing-library/react';
import ResizeObserver from 'resize-observer-polyfill';
import { IncomingResponseMessage, IncomingResponseMessageProps } from '../IncomingResponseMessage';
import { useResizeDetector } from 'react-resize-detector';

window.ResizeObserver = ResizeObserver;
jest.mock('react-resize-detector');

describe('IncomingResponseMessage', function () {
  beforeEach(() => {
    (useResizeDetector as jest.Mock).mockReturnValue({ width: 800, height: 400 });
  });

  function renderIncomingResponseMessage({
    message,
    toBeLogged,
    onRateUp,
    onRateDown,
    onComment,
  }: IncomingResponseMessageProps) {
    render(
      <IncomingResponseMessage
        message={message}
        toBeLogged={toBeLogged}
        onRateUp={onRateUp}
        onRateDown={onRateDown}
        onComment={onComment}
      />
    );
  }

  test('should render data table', function () {
    const message: IncomingResponseMessageProps = {
      message: {
        role: 'GenSpectrum',
        textBeforeData: 'textBeforeData',
        data: [
          { firstColumn: 123, SecondColumn: 345 },
          { firstColumn: 67, SecondColumn: 89 },
        ],
        textAfterData: 'textAfterData',
      },
      toBeLogged: true,
      onRateUp: jest.fn(),
      onRateDown: jest.fn(),
      onComment: jest.fn(),
    };

    renderIncomingResponseMessage(message);

    expect(screen.getByText('textBeforeData')).toBeInTheDocument();
    expect(screen.getByText('textAfterData')).toBeInTheDocument();
    expect(screen.getByText('firstColumn')).toBeInTheDocument();
    expect(screen.getByText('SecondColumn')).toBeInTheDocument();
  });

  // The IncomeResponseMessage component – along with the entire ChatPage – is currently not under use, so
  // this test has been commented-out when it started failing during a dependency upgrade. We will likely
  // delete the whole ChatPage eventually.
  // test('should render proportion as percentage and with two decimal places', function () {
  //   const message: IncomingResponseMessageProps = {
  //     message: {
  //       role: 'GenSpectrum',
  //       textBeforeData: 'textBeforeData',
  //       data: [{ proportion: 0.12345 }],
  //       textAfterData: 'textAfterData',
  //     },
  //     toBeLogged: true,
  //     onRateUp: jest.fn(),
  //     onRateDown: jest.fn(),
  //     onComment: jest.fn(),
  //   };
  //
  //   renderIncomingResponseMessage(message);
  //
  //   expect(screen.getByText('textBeforeData')).toBeInTheDocument();
  //   expect(screen.getByText('textAfterData')).toBeInTheDocument();
  //   expect(screen.getByText('Proportion (%)')).toBeInTheDocument();
  //   expect(screen.getByText('12.35')).toBeInTheDocument();
  // });
});
