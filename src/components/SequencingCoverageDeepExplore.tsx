import React from 'react';
import { SequencingRepresentativenessChartWidget } from '../widgets/SequencingRepresentativenessChartWidget';
import { NamedCard } from './NamedCard';
import { GridCell, PackedGrid } from './PackedGrid';
import { MetadataAvailabilityChartWidget } from '../widgets/MetadataAvailabilityChartWidget';
import { SequencingIntensityChartWidget } from '../widgets/SequencingIntensityChartWidget';
import { DateCountSampleDataset } from '../data/sample/DateCountSampleDataset';
import { CaseCountAsyncDataset } from '../data/CaseCountDataset';
import { DatelessCountrylessCountSampleDataset } from '../data/sample/DatelessCountrylessCountSampleDataset';

interface Props {
  dateCountDataset: DateCountSampleDataset;
  datelessCountDataset: DatelessCountrylessCountSampleDataset;
  caseCountDataset: CaseCountAsyncDataset;
}

export const SequencingCoverageDeepExplore = React.memo(
  ({ dateCountDataset, datelessCountDataset, caseCountDataset }: Props) => {
    return (
      <PackedGrid maxColumns={2}>
        <GridCell minWidth={600}>
          <SequencingIntensityChartWidget.ShareableComponent
            title='Sequencing Intensity Over Time'
            sequencingCounts={dateCountDataset}
            caseCounts={caseCountDataset}
            height={300}
            widgetLayout={NamedCard}
          />
        </GridCell>
        <GridCell minWidth={600}>
          <MetadataAvailabilityChartWidget.ShareableComponent
            title='Metadata Availability'
            sampleSet={datelessCountDataset}
            height={300}
          />
        </GridCell>
        {datelessCountDataset.selector.location.country === 'Switzerland' && (
          <GridCell minWidth={1600}>
            <SequencingRepresentativenessChartWidget.ShareableComponent
              title='Sequencing Intensity by Attribute'
              caseDataset={caseCountDataset}
              sampleDataset={datelessCountDataset}
              height={500}
            />
          </GridCell>
        )}
      </PackedGrid>
    );
  }
);
