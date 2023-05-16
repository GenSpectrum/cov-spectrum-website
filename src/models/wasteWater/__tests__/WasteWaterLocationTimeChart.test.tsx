import ResizeObserver from 'resize-observer-polyfill';
import { render, screen } from '@testing-library/react';
import { WasteWaterLocationTimeChart } from '../WasteWaterLocationTimeChart';
import { globalDateCache } from '../../../helpers/date-cache';
import { WasteWaterTimeseriesSummaryDataset } from '../types';
import { getTicks } from '../../../helpers/ticks';
import { formatDate } from '../WasteWaterTimeChart';

jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: any) => (
      <OriginalModule.ResponsiveContainer width={800} height={800}>
        {children}
      </OriginalModule.ResponsiveContainer>
    ),
  };
});

window.ResizeObserver = ResizeObserver;
jest.mock('react-resize-detector');

describe('WasteWaterLocationTimeChart', function () {
  it('should display no data message when no data is provided', function () {
    const datesOfData: string[] = [];
    const variantNames = ['variantName1', 'variantName2'];

    const dateRange = {
      dateFrom: globalDateCache.getDay('2020-01-01'),
      dateTo: globalDateCache.getDay('2020-01-02'),
    };

    const variants = getWasteWaterLocationTimeChartProps(datesOfData, variantNames);

    render(
      <div style={{ width: 500, height: 500 }}>
        <WasteWaterLocationTimeChart variants={variants} dateRange={dateRange} />
      </div>
    );

    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('should display WasteWaterLocationTimeChart when data is provided', function () {
    const datesOfData = ['2020-01-01', '2020-01-02', '2020-01-03', '2020-01-04'];
    const variantNames = ['variantName1', 'variantName2'];

    const dateRange = {
      dateFrom: globalDateCache.getDay('2019-01-02'),
      dateTo: globalDateCache.getDay('2021-01-04'),
    };

    const dateBetweenFromAndToThatDoesNotMatter = globalDateCache.getDay('2020-05-02');
    const expectedTicks = getTicks([
      { date: dateRange.dateFrom.dayjs.toDate() },
      { date: dateBetweenFromAndToThatDoesNotMatter.dayjs.toDate() },
      { date: dateRange.dateTo.dayjs.toDate() },
    ]);

    const variants = getWasteWaterLocationTimeChartProps(datesOfData, variantNames);

    render(<WasteWaterLocationTimeChart variants={variants} dateRange={dateRange} />);

    expect(screen.getByText('Estimated prevalence in wastewater samples')).toBeInTheDocument();
    expect(screen.getByText(formatDate(expectedTicks[0]))).toBeInTheDocument();
    expect(screen.getByText(formatDate(expectedTicks[2]))).toBeInTheDocument();
  });
});

function getWasteWaterLocationTimeChartProps(
  dates: string[],
  variants: string[]
): {
  name: string;
  data: WasteWaterTimeseriesSummaryDataset;
}[] {
  const unifiedDays = dates.map(date => {
    return globalDateCache.getDay(date);
  });

  return variants.map(variant => ({
    name: variant,
    data: unifiedDays.map(date => ({
      date,
      proportion: 0.1,
      proportionCI: [0.1, 0.1],
    })),
  }));
}
