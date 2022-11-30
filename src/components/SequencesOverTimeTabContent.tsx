import { useRef } from 'react';
import { Collection } from '../data/Collection';
import { Dataset } from '../data/Dataset';
import { LocationDateVariantSelector } from '../data/LocationDateVariantSelector';
import { PprettyRequest } from '../data/ppretty/ppretty-request';
import { DateCountSampleEntry } from '../data/sample/DateCountSampleEntry';
import { formatVariantDisplayName, VariantSelector } from '../data/VariantSelector';
import { VariantTimeDistributionChartWidget } from '../widgets/VariantTimeDistributionChartWidget';
import { PprettyGridExportButton } from './CombinedExport/PprettyGridExportButton';
import {
  PprettyGridExportManager,
  PprettyGridExportManagerContext,
} from './CombinedExport/PprettyGridExportManager';
import { GridCell, PackedGrid } from './PackedGrid';
import { ErrorAlert } from './ErrorAlert';

type SequencesOverTimeTabContentProps = {
  collection: Collection;
  variants: { query: VariantSelector; name: string; description: string }[];
  variantsDateCounts: PromiseSettledResult<Dataset<LocationDateVariantSelector, DateCountSampleEntry[]>>[];
  baselineDateCounts: Dataset<LocationDateVariantSelector, DateCountSampleEntry[]>;
  mode: 'Single' | 'CompareToBaseline';
};

export default function SequencesOverTimeTabContent({
  collection,
  variants,
  variantsDateCounts,
  baselineDateCounts,
  mode,
}: SequencesOverTimeTabContentProps) {
  const exportManagerRef = useRef(
    new PprettyGridExportManager(requests => {
      // TODO What happens if the arguments of SequencesOverTimeTabContent change? We probably need to update this
      //   function as well?
      const variantToDetailsMap = new Map<string, { name: string; description: string }>();
      for (let { query, name, description } of collection.variants) {
        const variantString = formatVariantDisplayName(JSON.parse(query));
        variantToDetailsMap.set(variantString, { name, description });
      }
      const mergedRequest: PprettyRequest = {
        config: {
          plotName: 'sequences-over-time_collection',
          plotType: 'line',
          sizeMultiplier: Math.max(Math.ceil(Math.sqrt(collection.variants.length)) / 2, 1),
        },
        metadata: {
          location: requests[0].metadata.location,
          collection: {
            id: collection.id,
            title: collection.title,
            maintainer: collection.maintainers,
          },
        },
        data: [],
      };
      for (let request of requests) {
        mergedRequest.data.push(
          ...request.data.map((d: any) => {
            const variant = request.metadata.variant;
            const { name, description } = variantToDetailsMap.get(variant)!;
            return {
              ...d,
              variant,
              name,
              description,
            };
          })
        );
      }
      return mergedRequest;
    })
  );

  return (
    <PprettyGridExportManagerContext.Provider value={exportManagerRef.current}>
      <PprettyGridExportButton />
      <PackedGrid maxColumns={3}>
        {variants.map((variant, i) => {
          const vdc = variantsDateCounts[i];
          if (vdc.status === 'fulfilled') {
            return (
              <GridCell minWidth={600} key={i}>
                <VariantTimeDistributionChartWidget.ShareableComponent
                  title={mode === 'Single' ? variant.name : `Comparing ${variant.name} to baseline`}
                  height={350}
                  variantSampleSet={vdc.value}
                  wholeSampleSet={baselineDateCounts}
                />
              </GridCell>
            );
          } else {
            return (
              <GridCell minWidth={600} key={i}>
                <ErrorAlert messages={[vdc.reason.message]} />
              </GridCell>
            );
          }
        })}
      </PackedGrid>
    </PprettyGridExportManagerContext.Provider>
  );
}
