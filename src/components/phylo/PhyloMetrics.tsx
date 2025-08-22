import { ExternalLink } from '../ExternalLink';
import React from 'react';
import { MRCAResponse } from '../../data/phylo/MRCAResponse';
import { Tooltip } from '@mui/material';

type PhyloMetricsProps = {
  mrca: MRCAResponse;
  totalVariantSequences: number;
  mrcaCladeSize: number;
};

export const PhyloMetrics = ({ mrca, totalVariantSequences, mrcaCladeSize }: PhyloMetricsProps) => {
  const cladeness = (totalVariantSequences - mrca.missingNodeCount) / mrcaCladeSize;
  return (
    <div>
      <ul className='list-disc ml-4'>
        <li>MRCA node: {mrca.mrcaNode}</li>
        <li>
          <Tooltip title='The number of sequences of the selected variant that could not be mapped to a tip of the tree'>
            <span className='underline decoration-dashed'>Missing nodes</span>
          </Tooltip>
          : {mrca.missingNodeCount} ({((mrca.missingNodeCount / totalVariantSequences) * 100).toFixed(2)}%)
        </li>
        <li>Total number of sequences in the MRCA clade: {mrcaCladeSize}</li>
        {/* TODO: Have a tooltip to explain what "cladeness" is */}
        <li>
          <Tooltip title='The number of sequences of the selected variant divided by the number of sequences of the MRCA-subtree; 100% means that the selected variant form a perfect clade'>
            <span className='underline decoration-dashed'>Cladeness</span>
          </Tooltip>
          : {(cladeness * 100).toFixed(2)}%
        </li>
      </ul>
      <div className='mt-4 text-sm text-gray-600'>
        Tree retrieved from{' '}
        <ExternalLink url='https://hgdownload.gi.ucsc.edu/goldenPath/wuhCor1/UShER_SARS-CoV-2/'>
          here
        </ExternalLink>
        , reconstructed with <ExternalLink url='https://github.com/yatisht/usher'>UShER</ExternalLink>,
        visualization powered by <ExternalLink url='https://taxonium.org/'>Taxonium</ExternalLink>
      </div>
    </div>
  );
};
