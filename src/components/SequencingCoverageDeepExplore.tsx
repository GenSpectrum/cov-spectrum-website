import React from 'react';
import { SequencingRepresentativenessPlotWidget } from '../widgets/SequencingRepresentativenessPlot';
import { Country } from '../services/api-types';
import { DateRange, dateRangeToDates } from '../services/api';
import dayjs from 'dayjs';
import { SequencingIntensityEntrySetWithSelector } from '../helpers/sequencing-intensity-entry-set';
import { SequencingIntensityPlotWidget } from '../widgets/SequencingIntensityPlot';
import { NamedCard } from './NamedCard';
import { GridCell, PackedGrid } from './PackedGrid';

interface Props {
  country: Country;
  dateRange: DateRange;
  sequencingIntensityEntrySet: SequencingIntensityEntrySetWithSelector;
}

export const SequencingCoverageDeepExplore = React.memo(
  ({ country, dateRange, sequencingIntensityEntrySet }: Props) => {
    let { dateFrom, dateTo } = dateRangeToDates(dateRange);
    return (
      <PackedGrid maxColumns={2}>
        <GridCell minWidth={600}>
          <SequencingIntensityPlotWidget.ShareableComponent
            title='Sequencing Intensity Over Time'
            sequencingIntensityEntrySet={sequencingIntensityEntrySet}
            height={300}
            widgetLayout={NamedCard}
          />
        </GridCell>
        {country === 'Switzerland' && (
          <GridCell minWidth={1600}>
            <SequencingRepresentativenessPlotWidget.ShareableComponent
              title='Sequencing Intensity by Attribute'
              selector={{
                country,
                dateFrom: dateFrom && dayjs(dateFrom).format('YYYY-MM-DD'),
                dateTo: dateTo && dayjs(dateTo).format('YYYY-MM-DD'),
              }}
              height={500}
            />
          </GridCell>
        )}
      </PackedGrid>
    );
  }
);
