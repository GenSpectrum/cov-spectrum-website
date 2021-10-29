import { Card, NamedCardStyle } from './NamedCard';
import Metrics from '../widgets/Metrics';
import { GridCell, PackedGrid } from './PackedGrid';
import { DateCountSampleDataset } from '../data/sample/DateCountSampleDataset';
import { useMemo } from 'react';

export type CoreMetricsProps = {
  variantSampleSet: DateCountSampleDataset;
  wholeSampleSet: DateCountSampleDataset;
};

export const CoreMetrics = ({ variantSampleSet, wholeSampleSet }: CoreMetricsProps) => {
  const { totalSequences, overallProportion } = useMemo(() => {
    const totalVariantSequences = variantSampleSet.getPayload().reduce((prev, curr) => prev + curr.count, 0);
    const totalOverallSequences = wholeSampleSet.getPayload().reduce((prev, curr) => prev + curr.count, 0);
    return {
      totalSequences: totalVariantSequences,
      overallProportion: totalVariantSequences / totalOverallSequences,
    };
  }, [variantSampleSet, wholeSampleSet]);

  return (
    <>
      <PackedGrid maxColumns={3}>
        <GridCell minWidth={300}>
          <Card namedCardStyle={NamedCardStyle.NORMAL}>
            <Metrics
              value={totalSequences}
              title='Total sequences'
              helpText='The total number of sequenced samples'
            />
          </Card>
        </GridCell>
        <GridCell minWidth={300}>
          <Card namedCardStyle={NamedCardStyle.NORMAL}>
            <Metrics
              value={(overallProportion * 100).toFixed(2)}
              title='Overall proportion'
              helpText='The proportion among all sequenced samples in the selected time frame'
              percent={true}
            />
          </Card>
        </GridCell>
      </PackedGrid>
    </>
  );
};
