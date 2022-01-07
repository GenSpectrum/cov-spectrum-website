import React from 'react';
import { SequencingRepresentativenessChartWidget } from '../widgets/SequencingRepresentativenessChartWidget';
import { NamedCard } from './NamedCard';
import { GridCell, PackedGrid } from './PackedGrid';
import { MetadataAvailabilityChartWidget } from '../widgets/MetadataAvailabilityChartWidget';
import { SequencingIntensityChartWidget } from '../widgets/SequencingIntensityChartWidget';
import { DateCountSampleData } from '../data/sample/DateCountSampleDataset';
import { DetailedSampleAggDataset } from '../data/sample/DetailedSampleAggDataset';
import { CaseCountAsyncDataset } from '../data/CaseCountDataset';
import { DatelessCountrylessCountSampleData } from '../data/sample/DatelessCountrylessCountSampleDataset';

interface Props {
  wholeDataset: DetailedSampleAggDataset;
  caseCountDataset: CaseCountAsyncDataset;
}

export const SequencingCoverageDeepExplore = React.memo(({ wholeDataset, caseCountDataset }: Props) => {
  return (
    <PackedGrid maxColumns={2}>
      <GridCell minWidth={600}>
        <SequencingIntensityChartWidget.ShareableComponent
          title='Sequencing Intensity Over Time'
          sequencingCounts={DateCountSampleData.fromDetailedSampleAggDataset(wholeDataset)}
          caseCounts={caseCountDataset}
          height={300}
          widgetLayout={NamedCard}
        />
      </GridCell>
      <GridCell minWidth={600}>
        <MetadataAvailabilityChartWidget.ShareableComponent
          title='Metadata Availability'
          sampleSet={DatelessCountrylessCountSampleData.fromDetailedSampleAggDataset(wholeDataset)}
          height={300}
        />
      </GridCell>
      {wholeDataset.selector.location.country === 'Switzerland' && (
        <GridCell minWidth={1600}>
          <SequencingRepresentativenessChartWidget.ShareableComponent
            title='Sequencing Intensity by Attribute'
            caseDataset={caseCountDataset}
            sampleDataset={DatelessCountrylessCountSampleData.fromDetailedSampleAggDataset(wholeDataset)}
            height={500}
          />
        </GridCell>
      )}
    </PackedGrid>
  );
});
