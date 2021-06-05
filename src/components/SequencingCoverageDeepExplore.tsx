import React from 'react';
import { SequencingRepresentativenessPlotWidget } from '../widgets/SequencingRepresentativenessPlot';
import { Country } from '../services/api-types';
import { DateRange, dateRangeToDates } from '../services/api';
import dayjs from 'dayjs';

interface Props {
  country: Country;
  dateRange: DateRange;
}

export const SequencingCoverageDeepExplore = React.memo(({ country, dateRange }: Props) => {
  let { dateFrom, dateTo } = dateRangeToDates(dateRange);
  return (
    <SequencingRepresentativenessPlotWidget.ShareableComponent
      title='Sequencing Intensity by Attribute'
      selector={{
        country,
        dateFrom: dateFrom && dayjs(dateFrom).format('YYYY-MM-DD'),
        dateTo: dateTo && dayjs(dateTo).format('YYYY-MM-DD'),
      }}
      height={500}
    />
  );
});
