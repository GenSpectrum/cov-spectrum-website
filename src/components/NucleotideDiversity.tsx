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
import { PipeDividedOptionsButtons } from '../helpers/ui';
//import { DeregistrationHandle, ExportManagerContext } from './CombinedExport/ExportManager';
//import download from 'downloadjs';
//import { csvStringify } from '../helpers/csvStringifyHelper';
//import { getConsensusSequenceFromMutations } from '../helpers/variant-consensus-sequence';
//import { decodeNucMutation } from '../helpers/nuc-mutation';
//import JSZip from 'jszip';
import { PercentageInput } from './PercentageInput';
import { NamedCard } from './NamedCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush, TooltipProps } from 'recharts' ;
import { SequenceType } from '../data/SequenceType';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

export interface Props {
    selector: LapisSelector;
}

interface NucelotideDiversityProps{

}

type PositionProportion = {
  mutation: string,
  proportion: number
}

type PositionProportions = {
    position: number,
    proportions: PositionProportion[],
    entropy: number
}

export const NucleotideDiversity = ({ selector }: Props) => {
    const [checked, setChecked] = useState<boolean>(false);
    const [plotType, setPlotType] = useState<string>('pos');
    const [sequenceType, setSequenceType] = useState<SequenceType>('nuc');
    const [ratio, setRatio] = useState(0.005);

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

    const controls = (
      <div className='mb-4'>
        {/*PLot type*/}
        <div className='mb-2 flex'>
          <PipeDividedOptionsButtons
            options={[
              { label: 'Entropy per position', value: 'pos' },
              { label: 'Entropy over time', value: 'time' },
            ]}
            selected={plotType}
            onSelect={setPlotType}
          />
        </div>
        {/* AA vs. nucs */}
        <div className='mb-2 flex'>
          <PipeDividedOptionsButtons
            options={[
              { label: 'NUC', value: 'nuc' },
              { label: 'AA', value: 'aa' },
            ]}
            selected={sequenceType}
            onSelect={setSequenceType}
          />
        </div>
        {/* Genes */}
       {/*  {sequenceType === 'aa' && (
          <div className='w-72 flex mb-2'>
            <div className='mr-2'>Gene:</div>
            <Form.Control
              as='select'
              value={gene}
              onChange={ev => setGene(ev.target.value)}
              className='flex-grow'
              size='sm'
            >
              <option value='all'>All</option>
              {ReferenceGenomeService.genes.map(g => (
                <option value={g} key={g}>
                  {g}
                </option>
              ))}
            </Form.Control>
          </div>
        )} */}
        <PercentageInput
          ratio={ratio}
          setRatio={setRatio}
          className='mr-2'
        />
      </div>
    );

    return (
        <>
            <NamedCard title="Nucleotide Diversity">
              <h3>Mean nucleotide entropy of all sequences: <b>{MeanNucleotideEntropy(data.nuc).toFixed(6)}</b></h3>
              {controls}
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  width={500}
                  height={500}
                  data={CalculateNucEntropy(data.nuc).filter(p => p.entropy > ratio)}
                  margin={{
                    top: 30,
                    right: 20,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="position" />
                  <YAxis domain={[0, 1]} />
                  {/* <Tooltip
                    formatter={(value: string) => [Number(value).toFixed(4), "Entropy"]}
                    labelFormatter={label => {
                      return 'Position: ' + label;
                    }}
                  /> */}
                  <Tooltip content={<CustomTooltip />}  allowEscapeViewBox={{ x: true, y: true}} />
                  <Legend />
                  <Bar dataKey="entropy" fill="#000000" legendType="none"/> 
                  <Brush dataKey="name" height={20} stroke="#000000" travellerWidth={10} />
                </BarChart>
              </ResponsiveContainer>
            </NamedCard>
        </>
    );
};

const CalculateNucEntropy = (
    nucs: MutationProportionEntry[]
): PositionProportions[] => {
    let positionProps = Array.apply(null, Array<PositionProportions>(29903)).map(function (x, i) { 
      let p: PositionProportions = {position: i, proportions: [], entropy: 0}
      return p;
    })

    //sort proportions to their positions
    nucs.forEach(nuc => {
      let position = parseInt(nuc.mutation.slice(1, -1));
      let proportion = nuc.proportion;
      let mutation = nuc.mutation.slice(-1);
      let reference = nuc.mutation.slice(1);
      if (mutation != '-') {
        let pp: PositionProportion = {mutation: mutation, proportion: proportion}
        positionProps[position-1].proportions.push(pp);
      };
    });

    //calculate remaining original nucleotide proportion
    positionProps.forEach(pos => {
      let propSum = 0;
      pos.proportions.forEach(p => propSum += p.proportion)
      let remainder = 1 - propSum;
      if (remainder != 0){
        let pp: PositionProportion = {mutation: "ref", proportion: remainder} //set reference flag as mutation, so it can later be displayed correctly
        pos.proportions.push(pp);
      }
    })

    positionProps.map(p => {
      let sum = 0;
      p.proportions.forEach(pp => sum += pp.proportion*Math.log(pp.proportion));
      p.entropy = -sum;
    })

    console.log(positionProps);
    return positionProps;
}

const MeanNucleotideEntropy = (
  nucs: MutationProportionEntry[]
): number => {
  let entropy = CalculateNucEntropy(nucs);

  let sum = 0;
  entropy.forEach(e => sum += e.entropy);
  const avg = (sum / entropy.length) || 0;

  return avg;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) => {
  console.log(payload)
  if (active) {
    return (
      <div className="recharts-tooltip-wrapper custom-tooltip">
        <p className="label"><b>{`Position: ${label}`}</b></p>
        <p className="label"><b>{`Entropy: ${payload?.[0].value}`}</b></p>
        
        <p className="desc">Nucleotide proportions:</p>
        <p className="desc">{`${payload?.[0].payload?.proportions[0]?.mutation} : ${payload?.[0].payload?.proportions[0]?.proportion}`}</p>
        <p className="desc">{`${payload?.[0].payload?.proportions[1]?.mutation} : ${payload?.[0].payload?.proportions[1]?.proportion}`}</p>
        <p className="desc">{`${payload?.[0].payload?.proportions[2]?.mutation} : ${payload?.[0].payload?.proportions[2]?.proportion}`}</p>
        <p className="desc">{`${payload?.[0].payload?.proportions[3]?.mutation} : ${payload?.[0].payload?.proportions[3]?.proportion}`}</p>
      </div>
    );
  }

  return null;
};