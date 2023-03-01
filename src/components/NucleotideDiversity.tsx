import React, { useState } from 'react';
//import styled from 'styled-components';
//import { MutationName } from './MutationName';
//import { decodeAAMutation } from '../helpers/aa-mutation';
import { MutationProportionData } from '../data/MutationProportionDataset';
import Loader from './Loader';
import { useQuery } from '../helpers/query-hook';
import { MutationProportionEntry } from '../data/MutationProportionEntry';
import { fetchSamplesCount } from '../data/api-lapis';
//import { ReferenceGenomeService } from '../services/ReferenceGenomeService';
import { LapisSelector } from '../data/LapisSelector';
//import { useResizeDetector } from 'react-resize-detector';
//import Checkbox from '@mui/material/Checkbox';
//import FormGroup from '@mui/material/FormGroup';
//import FormControlLabel from '@mui/material/FormControlLabel';
//import { PipeDividedOptionsButtons } from '../helpers/ui';
//import { DeregistrationHandle, ExportManagerContext } from './CombinedExport/ExportManager';
//import download from 'downloadjs';
//import { csvStringify } from '../helpers/csvStringifyHelper';
//import { getConsensusSequenceFromMutations } from '../helpers/variant-consensus-sequence';
//import { decodeNucMutation } from '../helpers/nuc-mutation';
//import JSZip from 'jszip';
//import { ProportionSelector } from './ProportionsSelector';
import { NamedCard } from './NamedCard';

export interface Props {
    selector: LapisSelector;
}

interface NucelotideDiversityProps{

}

type PositionProportion = {
    mutation: string,
    proportion: number
}

export const NucleotideDiversity = ({ selector }: Props) => {
    const [checked, setChecked] = useState<boolean>(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setChecked(event.target.checked);
    };

    const queryStatus = useQuery(
        signal => {
          return Promise.all([
            fetchSamplesCount(selector, signal),
            MutationProportionData.fromApi(selector, 'aa', signal, 0),
            MutationProportionData.fromApi(selector, 'nuc', signal, 0),
          ]).then(async ([variantCount, aaMutationDataset, nucMutationDataset]) => {
            const aa: MutationProportionEntry[] = aaMutationDataset.payload.map(m => m);
            const nuc: MutationProportionEntry[] = nucMutationDataset.payload.map(m => m);
            return {
              variantCount,
              aa,
              nuc
            };
          });
        },
        [selector]
      );

    // View
    if (queryStatus.isLoading || !queryStatus.data) {
        return <Loader />;
    }

    const data = queryStatus.data;
    console.log(data)

    return (
        <>
            <NamedCard title="Nucleotide Diversity">
              <h3>Mean nucleotide entropy of all samples: <b>{MeanNucleotideEntropy(data.nuc).toFixed(6)}</b></h3>
                {/* { CalculateNucEntropy(data.nuc).map(posProp =>
                  <div>
                    <p>{posProp}</p>
                  </div>
                )} */}
            </NamedCard>
        </>
    );
};

const CalculateNucEntropy = (
    nucs: MutationProportionEntry[]
) => {

    //sort proportions to their positions
    let positionProps = Array(29903).fill(null).map(() => new Array);
    nucs.forEach(nuc => {
      let position = parseInt(nuc.mutation.slice(1, -1));
      let proportion = nuc.proportion;
      let mutation = nuc.mutation.slice(-1);
      //let p: PositionProportion = {mutation, proportion}
      if (mutation != '-') {positionProps[position].push(proportion)};
    });

    //calculate remaining original nucleotide proportion
    positionProps.forEach(pos => {
      let propSum = pos.reduce(function (accumVariable, curValue) {
          return accumVariable + curValue
        }, 0);
      let remainder = 1 - propSum;
      pos.push(remainder);
    })
    console.log(positionProps);

    //convert proportions to entropy
    let positionLogs = positionProps.map(p => {
      let sum = 0;
      p.forEach(proportion => sum += proportion*Math.log(proportion));
      return -sum;
    })

    return positionLogs;
}

const MeanNucleotideEntropy = (
  nucs: MutationProportionEntry[]
): number => {
  let logs = CalculateNucEntropy(nucs);

  const sum = logs.reduce((a, b) => a + b, 0);
  const avg = (sum / logs.length) || 0;

  console.log(sum);
  console.log(logs.length)

  return avg;
}