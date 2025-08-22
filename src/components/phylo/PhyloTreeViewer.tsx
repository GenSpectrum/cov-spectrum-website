import Taxonium from 'taxonium-component';
import React, { useCallback, useState } from 'react';
import { ExternalLink } from '../ExternalLink';
import { useExploreUrl } from '../../helpers/explore-url';
import { Link } from 'react-router';
import { ColorByOption } from './PhyloColorBySelector';
import { LapisSelector } from '../../data/LapisSelector';
import { fetchDetails, fetchNewickTree } from '../../data/api-lapis';
import { useQuery } from '../../helpers/query-hook';

type Node = {
  id: string;
  type: 'inner' | 'tip';
};

export type TreeViewerProps = {
  variantSelector: LapisSelector;
  treeSelector: LapisSelector;
  selectedColorBy: ColorByOption;
  availableColorByOptions: ColorByOption[];
};

export const PhyloTreeViewer = ({
  variantSelector,
  treeSelector,
  selectedColorBy,
  availableColorByOptions,
}: TreeViewerProps) => {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const exploreUrl = useExploreUrl()!;

  const queryResponse = useQuery(
    async signal => {
      const colorByMetadataFields = availableColorByOptions
        .filter(o => o.type === 'metadata')
        .map(o => o.value);

      const [treeNwk, variantSequences, metadata] = await Promise.all([
        fetchNewickTree(treeSelector, signal),
        fetchDetails(variantSelector, ['usherTree'] as const, signal),
        fetchDetails(treeSelector, ['usherTree', ...colorByMetadataFields, 'date'], signal),
      ]);

      const variantSet = new Set<string>(variantSequences.map(s => s.usherTree));

      const colorMap: Record<string, RGBColor> = {
        'Selected variant': [31, 64, 122],
        'Other variant': [243, 243, 243],
      };

      const rows = metadata.map(entry => {
        const values = colorByMetadataFields.map(field => {
          const value = entry[field];
          if (!(value in colorMap)) {
            colorMap[value] = hashStringToColor(value);
          }
          return value;
        });
        const variantLabel = variantSet.has(entry.usherTree) ? 'Selected variant' : 'Other variant';
        return [entry.usherTree, ...values, entry.date, variantLabel].join('\t');
      });

      const metadataTsv = [
        ['usherTree', ...colorByMetadataFields, 'date', 'selectedVariant'].join('\t'),
        ...rows,
      ].join('\n');

      return { treeNwk, metadataTsv, colorMap };
    },
    [variantSelector, treeSelector, availableColorByOptions]
  );

  const onNodeDetailsLoaded = useCallback(
    (_: number, details: { name: string } | null) => {
      if (details !== null) {
        setSelectedNode({
          id: details.name,
          type: details.name.startsWith('node_') ? 'inner' : 'tip',
        });
      } else {
        setSelectedNode(null);
      }
    },
    [setSelectedNode]
  );

  if (queryResponse.isLoading) {
    return <>Loading…</>;
  }

  if (queryResponse.isError || queryResponse.data === undefined) {
    return <>Something went wrong.</>;
  }

  const { treeNwk, metadataTsv, colorMap } = queryResponse.data;

  return (
    <div className='flex flex-col h-full'>
      <div className='flex gap-4'>
        <div className='font-bold'>Selected node:</div>
        {selectedNode !== null ? (
          <>
            <div>{selectedNode.id}</div>
            {selectedNode.type === 'inner' ? (
              <>
                {variantSelector.variant?.variantQuery === undefined && (
                  <Link
                    className='underline'
                    to={
                      exploreUrl.setVariants(
                        [
                          {
                            ...variantSelector.variant,
                            'usherTree.phyloDescendantOf': selectedNode.id,
                          },
                        ],
                        undefined,
                        true
                      ) ?? '#'
                    }
                  >
                    Add to filter
                  </Link>
                )}
                <Link
                  className='underline'
                  to={
                    exploreUrl.setVariants(
                      [
                        {
                          'usherTree.phyloDescendantOf': selectedNode.id,
                        },
                      ],
                      undefined,
                      true
                    ) ?? '#'
                  }
                >
                  Search
                </Link>
              </>
            ) : (
              <ExternalLink url={`https://www.ncbi.nlm.nih.gov/nuccore/${selectedNode.id}`}>
                Open in GenBank
              </ExternalLink>
            )}
          </>
        ) : (
          <div className='text-gray-400 italic'>None</div>
        )}
      </div>

      <div className='flex-1'>
        <Taxonium
          onNodeDetailsLoaded={onNodeDetailsLoaded}
          sourceData={{
            status: 'loaded',
            filename: 'test.nwk',
            data: treeNwk,
            filetype: 'nwk',
            metadata: {
              status: 'loaded',
              filename: 'test.nwk',
              data: metadataTsv,
              filetype: 'meta_tsv',
            },
          }}
          query={{ color: JSON.stringify({ field: 'meta_' + selectedColorBy.value }) }}
          sidePanelHiddenByDefault={true}
          configDict={{ colorMapping: colorMap }}
        />
      </div>
    </div>
  );
};

type RGBColor = [number, number, number];

function hashStringToColor(s: string | null | undefined): RGBColor {
  if (s === null || s === undefined) {
    return [243, 243, 243];
  }
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 0x5bd1e995);
    h ^= h >>> 15;
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return [h & 255, (h >>> 8) & 255, (h >>> 16) & 255];
}
