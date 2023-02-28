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
    console.log(data);
    
    return (
        <>
            <NamedCard title="Nucleotide Diversity">
                <p> { data.variantCount }</p>
            </NamedCard>
        </>
    );
};