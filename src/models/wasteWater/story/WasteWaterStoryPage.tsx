import React, { useEffect, useState } from 'react';
import { ExternalLink } from '../../../components/ExternalLink';
import Loader from '../../../components/Loader';
import { GridCell, PackedGrid } from '../../../components/PackedGrid';
import { WasteWaterLocationTimeWidget } from '../WasteWaterLocationTimeWidget';
import { ShowMoreButton } from '../../../helpers/ui';
import DateRangePicker from '../../../components/DateRangePicker';
import { DateRangeSelector, SpecialDateRangeSelector } from '../../../data/DateRangeSelector';
import { filterByDateRange, minMaxDate, useWasteWaterData } from './WasteWaterStoryPageHooks';

const WasteWaterSamplingSites = () => {
  const wasteWaterData = useWasteWaterData();
  const [dateRangeSelector, setDateRangeSelector] = useState<DateRangeSelector>(
    new SpecialDateRangeSelector('Past6M')
  );

  if (!wasteWaterData) {
    return <Loader />;
  }

  const dataInTimeRange = filterByDateRange(wasteWaterData, dateRangeSelector.getDateRange());
  const { dateFrom, dateTo } = minMaxDate(dataInTimeRange);
  if (dateTo === undefined || dateFrom === undefined) {
    return <Loader />;
  }

  return (
    <>
      <DateRangePicker dateRangeSelector={dateRangeSelector} onChangeDate={setDateRangeSelector} />

      <PackedGrid maxColumns={2}>
        {dataInTimeRange.map(dataset => (
          <GridCell minWidth={600} key={dataset.location}>
            <WasteWaterLocationTimeWidget.ShareableComponent
              country='Switzerland'
              location={dataset.location}
              title={dataset.location}
              variants={dataset.variantsTimeseriesSummaries}
              dateRange={{ dateFrom, dateTo }}
              height={300}
              toolbarChildren={[
                <ShowMoreButton
                  to={'/story/wastewater-in-switzerland/location/' + dataset.location}
                  key={`showmore${dataset.location}`}
                />,
              ]}
            />
          </GridCell>
        ))}
      </PackedGrid>
    </>
  );
};

export const WasteWaterStoryPage = () => {
  useEffect(() => {
    document.title = `Wastewater in Switzerland - Stories - covSPECTRUM`;
  });

  return (
    <div className='px-4 md:px-8'>
      <h1>Wastewater in Switzerland</h1>
      <div className='italic'>
        by{' '}
        <ExternalLink url='https://bsse.ethz.ch/cbg/'>Computational Biology Group, ETH Zurich</ExternalLink>
      </div>
      <p>
        We analyze wastewater samples collected at different Swiss wastewater treatment plants (
        <ExternalLink url='https://bsse.ethz.ch/cbg/research/computational-virology/sarscov2-variants-wastewater-surveillance.html#data-sources'>
          see our website for the sources
        </ExternalLink>
        ) using next-generation sequencing (done by <ExternalLink url='https://fgcz.ch/'>FGCZ</ExternalLink>),
        process the resulting short-read data with{' '}
        <ExternalLink url='https://cbg-ethz.github.io/V-pipe/'>V-pipe</ExternalLink>, and search for mutations
        characteristic of several variants of concern. The relative frequency of each signature mutation is
        determined, and all frequencies are combined per day, which provides an estimate of the relative
        prevalence of the variant in the population. Some variants have specific signature mutations that
        co-occur on the same fragment. Amplicons with such co-occurrences are included in the heatmaps of the
        wastewater data displayed in the detailed plots (see{' '}
        <ExternalLink url='https://doi.org/10.1101/2021.01.08.21249379'>
          doi:10.1101/2021.01.08.21249379
        </ExternalLink>{' '}
        and <ExternalLink url='https://github.com/cbg-ethz/cowwid'>cowwid</ExternalLink> for more details, or
        at the{' '}
        <ExternalLink url='https://bsse.ethz.ch/cbg/research/computational-virology/sarscov2-variants-wastewater-surveillance.html#par_textimage_974930497'>
          bottom of our webpage for a video presentation
        </ExternalLink>
        ).
      </p>
      <WasteWaterSamplingSites />
    </div>
  );
};
