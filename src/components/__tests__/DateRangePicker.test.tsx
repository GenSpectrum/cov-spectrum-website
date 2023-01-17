import { render, screen } from '@testing-library/react';
import DateRangePicker from '../DateRangePicker';
import ResizeObserver from 'resize-observer-polyfill';
import { useResizeDetector } from 'react-resize-detector';
import userEvent from '@testing-library/user-event';
import { DateRange } from '../../data/DateRange';
import { globalDateCache } from '../../helpers/date-cache';
import dayjs from 'dayjs';

window.ResizeObserver = ResizeObserver;
jest.mock('react-resize-detector');
const onChangeDateMock = jest.fn();
describe('DateRangePicker', () => {
  beforeEach(() => {
    onChangeDateMock.mockReset();
    (useResizeDetector as jest.Mock).mockReturnValue({ width: 800, height: 400 });
  });

  function renderDateRangePicker(dateRange?: DateRange) {
    render(
      <DateRangePicker
        dateRangeSelector={{
          getDateRange() {
            return dateRange || {};
          },
        }}
        onChangeDate={onChangeDateMock}
      />
    );
  }

  function fromPicker() {
    return screen.getByLabelText('from');
  }

  function toPicker() {
    return screen.getByLabelText('to');
  }

  function predefinedRangesDropdown() {
    return screen.getByRole('combobox');
  }

  test('should render', () => {
    renderDateRangePicker();

    expect(fromPicker()).toBeInTheDocument();
    expect(toPicker()).toBeInTheDocument();
    expect(predefinedRangesDropdown()).toBeInTheDocument();
  });

  test('should set dates from predefined date ranges', () => {
    renderDateRangePicker();

    userEvent.selectOptions(predefinedRangesDropdown(), '2020');

    expect(fromPicker()).toHaveValue('2020-01-06');
    expect(toPicker()).toHaveValue('2021-01-03');
    expect(onChangeDateMock).toHaveBeenCalledWith({ mode: 'Y2020' });
  });

  test('should display invalid date entered by user', () => {
    renderDateRangePicker();

    userEvent.clear(fromPicker());
    userEvent.type(fromPicker(), '1');

    expect(fromPicker()).toHaveValue('1');
    expect(onChangeDateMock).not.toHaveBeenCalled();
  });

  test('should set correct date on user input', () => {
    renderDateRangePicker();

    userEvent.clear(fromPicker());
    userEvent.type(fromPicker(), '2020-01-06');

    userEvent.clear(toPicker());
    userEvent.type(toPicker(), '2021-01-06');

    expect(fromPicker()).toHaveValue('2020-01-06');
    expect(toPicker()).toHaveValue('2021-01-06');
    expect(onChangeDateMock).toHaveBeenCalled();
  });

  test('should display dates passed via props', () => {
    let fromDate = globalDateCache.getDayUsingDayjs(dayjs('2020-01-06'));
    let toDate = globalDateCache.getDayUsingDayjs(dayjs('2021-01-06'));
    renderDateRangePicker({ dateFrom: fromDate, dateTo: toDate });

    expect(fromPicker()).toHaveValue('2020-01-06');
    expect(toPicker()).toHaveValue('2021-01-06');
  });
});
