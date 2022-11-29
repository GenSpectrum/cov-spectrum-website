import { LapisSelector } from '../data/LapisSelector';
import { SamplingStrategy } from '../data/SamplingStrategy';
import { SpecialDateRangeSelector } from '../data/DateRangeSelector';
import { useQuery } from '../helpers/query-hook';
import { _fetchAggSamples } from '../data/api-lapis';
import { FullSampleAggEntry } from '../data/sample/FullSampleAggEntry';
import Loader from '../components/Loader';
import { useMemo } from 'react';
import { GridPlot } from '../components/GridPlot';

export const ManyPage = () => {
  const selector: LapisSelector = {
    location: {},
    variant: {},
    dateRange: new SpecialDateRangeSelector('Past6M'),
    samplingStrategy: SamplingStrategy.AllSamples,
    host: undefined,
    qc: {},
  };

  const datePangoLineageCountQuery = useQuery(
    signal =>
      _fetchAggSamples(selector, ['date', 'nextcladePangoLineage'], signal) as Promise<
        Pick<FullSampleAggEntry, 'date' | 'nextcladePangoLineage' | 'count'>[]
      >,
    [selector]
  );

  const data = useMemo(() => {
    if (!datePangoLineageCountQuery.data) {
      return undefined;
    }
    return datePangoLineageCountQuery.data.filter(
      d =>
        d.nextcladePangoLineage?.startsWith('BA.5.') &&
        (d.nextcladePangoLineage?.match(/\./g) ?? []).length === 2 &&
        !!d.date
    );
  }, [datePangoLineageCountQuery]);

  if (!data) {
    return <Loader />;
  }

  console.log(data);

  return (
    <>
      {/* TODO What to do about small screens? */}
      <div
        style={{
          // Subtracting the header  TODO It's not good to have these constants here
          height: 'calc(100vh - 72px - 2px)',
        }}
        className='flex flex-row'
      >
        {/* The parent node */}
        <div style={{ width: 300, minWidth: 300 }} className='border-2 border-solid border-red-800'></div>
        {/* The main area */}
        <div className='flex-grow border-2 border-solid border-blue-800 p-12'>
          <GridPlot data={data} plotWidth={200} plotHeight={200} numberColumns={5} />
        </div>
      </div>
    </>
  );
};

type PositionInGrid =
  | 'top-left-corner'
  | 'top-right-corner'
  | 'bottom-left-corner'
  | 'bottom-right-corner'
  | 'left-edge'
  | 'top-edge'
  | 'right-edge'
  | 'bottom-edge'
  | 'center';
