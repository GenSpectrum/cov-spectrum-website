import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import download from 'downloadjs';
import { globalDateCache } from '../../helpers/date-cache';
import { ExportManager, ExportManagerContext } from '../../components/CombinedExport/ExportManager';
import {
  VariantTimeDistributionLineChartEntry,
  VariantTimeDistributionLineChartInner,
} from '../VariantTimeDistributionLineChartInner';

jest.mock('recharts');
jest.mock('downloadjs');

const sequenced = [10, 10, 10, 10, 10, 10, 10, 0, 0, 0, 0, 0, 0, 0];
const variantCounts = [0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const data: VariantTimeDistributionLineChartEntry[] = sequenced.map((s, i) => ({
  date: globalDateCache.getDay(`2022-01-${String(i + 1).padStart(2, '0')}`),
  sequenced: s,
  variantCount: variantCounts[i],
}));

async function exportCsv(exportManager: ExportManager): Promise<string> {
  const csvExport = [...exportManager.getRegistered()].find(e => e.label === 'Download CSV');
  await csvExport!.doExport();
  const downloadMock = download as unknown as jest.Mock;
  return downloadMock.mock.calls[downloadMock.mock.calls.length - 1][0];
}

describe('<VariantTimeDistributionLineChartInner>', () => {
  it('exports proportions in proportion mode', async () => {
    const exportManager = new ExportManager();
    render(
      <ExportManagerContext.Provider value={exportManager}>
        <VariantTimeDistributionLineChartInner data={data} />
      </ExportManagerContext.Provider>
    );

    const csv = await exportCsv(exportManager);

    expect(csv.split('\r\n')[0]).toBe('date,proportion,proportionCILow,proportionCIHigh');
  });

  it('exports daily counts and their 7-day average in absolute mode', async () => {
    const exportManager = new ExportManager();
    render(
      <ExportManagerContext.Provider value={exportManager}>
        <VariantTimeDistributionLineChartInner data={data} />
      </ExportManagerContext.Provider>
    );

    await userEvent.click(screen.getByText('Absolute'));
    const csv = await exportCsv(exportManager);

    expect(csv.split('\r\n')).toEqual([
      'date,count,countSevenDayAverage',
      '"2022-01-04",7,"1.0000"',
      '"2022-01-05",0,"1.0000"',
      '"2022-01-06",0,"1.0000"',
      '"2022-01-07",0,"1.0000"',
      '"2022-01-08",0,"0.0000"',
      '"2022-01-09",0,"0.0000"',
      '"2022-01-10",0,"0.0000"',
      '"2022-01-11",0,"0.0000"',
    ]);
  });

  it('shows zero samples in absolute mode for a 7-day window without sequences', async () => {
    const lateVariantData = data.map((entry, i) => ({ ...entry, variantCount: i === 6 ? 7 : 0 }));
    render(<VariantTimeDistributionLineChartInner data={lateVariantData} />);

    await userEvent.click(screen.getByText('Absolute'));

    expect(screen.getByText('Samples')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
