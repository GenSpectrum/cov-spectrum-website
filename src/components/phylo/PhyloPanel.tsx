import { LapisSelector } from '../../data/LapisSelector';
import { fetchMRCA, fetchSamplesCount } from '../../data/api-lapis';
import { useQuery } from '../../helpers/query-hook';
import { DateCountSampleDataset } from '../../data/sample/DateCountSampleDataset';
import React, { useMemo, useState } from 'react';
import { PhyloTreeViewer } from './PhyloTreeViewer';
import { useFullscreenStatus } from '../../helpers/use-fullscreen';
import { PhyloMetrics } from './PhyloMetrics';
import {
  ColorByOption,
  colorByOptions,
  PhyloColorBySelector,
  useAvailableColorByOptions,
} from './PhyloColorBySelector';
import { PhyloSampling, PhyloSamplingSelector } from './PhyloSamplingSelector';
import { useResizeDetector } from 'react-resize-detector';

export type PhyloPanelProps = {
  ldvsSelector: LapisSelector;
  ldsSelector: LapisSelector;
  variantSampleSet: DateCountSampleDataset;
};

export const PhyloPanel = ({ ldvsSelector, ldsSelector, variantSampleSet }: PhyloPanelProps) => {
  const [sampling, setSampling] = useState<PhyloSampling>('only-variant');
  const [colorBy, setColorBy] = useState<ColorByOption>(colorByOptions[2]);
  const [loadLargeTree, setLoadLargeTree] = useState(false);
  const { width: _width, ref } = useResizeDetector<HTMLDivElement>();
  const width = _width ?? -1;
  const availableColorByOptions = useAvailableColorByOptions();

  const queryResponse = useQuery(
    async signal => {
      const mrca = await fetchMRCA(ldvsSelector, signal);
      const mrcaCladeSize = await fetchSamplesCount(
        {
          ...ldsSelector,
          variant: {
            ...ldsSelector.variant,
            'usherTree.phyloDescendantOf': mrca.mrcaNode ?? undefined,
          },
        },
        signal
      );
      return { mrca, mrcaCladeSize };
    },
    [ldvsSelector]
  );

  const totalVariantSequences = useMemo(() => {
    return variantSampleSet.payload.reduce((prev, curr) => prev + curr.count, 0);
  }, [variantSampleSet]);

  const isFullscreen = useFullscreenStatus();

  if (queryResponse.isLoading) {
    return <>Loading…</>;
  }

  if (queryResponse.isError || queryResponse.data === undefined) {
    return <>Something went wrong.</>;
  }

  const { mrca, mrcaCladeSize } = queryResponse.data;
  const numberTipsOfTree = totalVariantSequences - mrca.missingNodeCount;

  const treeSelector =
    sampling === 'only-variant'
      ? ldvsSelector
      : {
          ...ldsSelector,
          variant: {
            'usherTree.phyloDescendantOf': mrca.mrcaNode ?? undefined,
          },
        };

  let treeElement: React.JSX.Element;
  if (numberTipsOfTree === 0) {
    treeElement = (
      <div className='flex-1'>The tree does not contain any sequence of the selected variant.</div>
    );
  } else if (width < 500) {
    treeElement = (
      <div>
        The screen is too small to visualize the phylogeny. To see the phylogeny, try switching to landscape
        or using a larger screen.
      </div>
    );
  } else if (numberTipsOfTree > 100000 && !loadLargeTree) {
    treeElement = (
      <button onClick={() => setLoadLargeTree(true)} className='underline'>
        The tree has more than 100,000 tips and may take some time to load. Click here to load the tree.
      </button>
    );
  } else {
    treeElement = (
      <div className={width < 900 ? '' : 'min-w-[500px] flex-1'}>
        <PhyloSamplingSelector sampling={sampling} onChange={setSampling} />

        <div className={isFullscreen ? 'h-full' : 'h-[500px]'}>
          <PhyloTreeViewer
            key={sampling}
            variantSelector={ldvsSelector}
            treeSelector={treeSelector}
            selectedColorBy={colorBy}
            availableColorByOptions={availableColorByOptions}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={'flex gap-4 bg-white' + (isFullscreen ? ' p-8' : '') + (width < 900 ? ' flex-col' : '')}
      ref={ref}
    >
      {treeElement}

      <div className={'border border-1 p-4' + (width < 900 ? ' ' : ' w-[400px]')}>
        <button
          onClick={() => {
            if (ref.current) {
              if (isFullscreen) {
                void document.exitFullscreen();
              } else {
                ref.current.requestFullscreen();
              }
            }
          }}
          className='underline text-sm mb-2'
        >
          {!isFullscreen ? 'Show in' : 'Exit'} fullscreen
        </button>

        <PhyloMetrics
          mrca={mrca}
          totalVariantSequences={totalVariantSequences}
          mrcaCladeSize={mrcaCladeSize}
        />
        {width > 500 && (
          <PhyloColorBySelector options={availableColorByOptions} selected={colorBy} onChange={setColorBy} />
        )}
      </div>
    </div>
  );
};
