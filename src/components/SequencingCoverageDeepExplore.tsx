import React from 'react';
import { SequencingRepresentativenessChartWidget } from '../widgets/SequencingRepresentativenessChartWidget';
import { NamedCard } from './NamedCard';
import { GridCell, PackedGrid } from './PackedGrid';
import { MetadataAvailabilityChartWidget } from '../widgets/MetadataAvailabilityChartWidget';
import { SequencingIntensityChartWidget } from '../widgets/SequencingIntensityChartWidget';
import { DateCountSampleDataset } from '../data/sample/DateCountSampleDataset';
import { DetailedSampleAggDataset } from '../data/sample/DetailedSampleAggDataset';
import { AsyncDataset } from '../data/AsyncDataset';
import { LocationDateSelector } from '../data/LocationDateSelector';
import { CaseCountEntry } from '../data/CaseCountEntry';

interface Props {
  wholeDataset: DetailedSampleAggDataset;
  caseCountDataset: AsyncDataset<LocationDateSelector, CaseCountEntry[]>;
}

export const SequencingCoverageDeepExplore = React.memo(({ wholeDataset, caseCountDataset }: Props) => {
  return (
    <PackedGrid maxColumns={2}>
      <GridCell minWidth={600}>
        <SequencingIntensityChartWidget.ShareableComponent
          title='Sequencing Intensity Over Time'
          sequencingCounts={DateCountSampleDataset.fromDetailedSampleAggDataset(wholeDataset)}
          caseCounts={caseCountDataset}
          height={300}
          widgetLayout={NamedCard}
        />
      </GridCell>
      <GridCell minWidth={600}>
        <MetadataAvailabilityChartWidget.ShareableComponent
          title='Metadata Availability'
          sampleSet={wholeDataset}
          height={300}
        />
      </GridCell>
      {wholeDataset.getSelector().location.country === 'Switzerland' && (
        <GridCell minWidth={1600}>
          <SequencingRepresentativenessChartWidget.ShareableComponent
            title='Sequencing Intensity by Attribute'
            caseDataset={caseCountDataset}
            sampleDataset={wholeDataset}
            height={500}
          />
        </GridCell>
      )}
    </PackedGrid>
  );
});
