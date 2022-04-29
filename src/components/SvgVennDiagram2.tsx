import { useExploreUrl } from '../helpers/explore-url';
import ReactTooltip from 'react-tooltip';
import { LapisSelector } from '../data/LapisSelector';
import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '../helpers/query-hook';
import { MutationProportionData } from '../data/MutationProportionDataset';
import { ReferenceGenomeService } from '../services/ReferenceGenomeService';
import Loader from './Loader';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import Slider from 'rc-slider';
import { useResizeDetector } from 'react-resize-detector';
import styled from 'styled-components';
import { intersections2 } from '../helpers/intersections';

import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import './style/svgPlots.css';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

interface PlotContProps {
  width: number;
}

const PlotContainer = styled.div<PlotContProps>`
  overflow: ${props => (props.width < 500 ? 'scroll' : 'auto')};
`;

export interface Props {
  selectors: LapisSelector[];
}

export const SvgVennDiagram2 = ({ selectors }: Props) => {
  const [geneName, setGeneName] = useState<string[]>([]);

  const handleChange = (event: SelectChangeEvent<typeof geneName>) => {
    const {
      target: { value },
    } = event;
    setGeneName(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value
    );
  };

  const { width, ref } = useResizeDetector<HTMLDivElement>();
  const [minProportion, setMinProportion] = useState(0.5);
  const res = useQuery(
    signal => Promise.all(selectors.map(selector => MutationProportionData.fromApi(selector, 'aa', signal))),
    [selectors],
    useEffect
  );
  const exploreUrl = useExploreUrl()!;
  const variants = exploreUrl.variants;
  const data = useMemo(() => {
    if (!res.data || res.data.length !== 2) {
      return undefined;
    }
    const [variant1, variant2] = res.data;
    const variant1Mutations = variant1.payload
      .filter(m => m.proportion >= minProportion)
      .map(m => m.mutation);
    const variant2Mutations = variant2.payload
      .filter(m => m.proportion >= minProportion)
      .map(m => m.mutation);

    return intersections2(variant1Mutations, variant2Mutations);
  }, [res.data, minProportion]);

  if (selectors.length !== 2) {
    throw new Error(
      `<VariantMutationComparison> is used with ${selectors.length} variants, ` +
        'but this component only supports comparisons of 2  variants.'
    );
  }
  if (res.isError) {
    throw new Error('Data fetching failed: ' + JSON.stringify(res.error));
  }
  if (res.isLoading || !res.data || !data) {
    return <Loader />;
  }

  let filteredData: typeof data = data;

  if (geneName.length > 0) {
    filteredData = data.filter(item => geneName.includes(item.gene));
  }

  let allMutations: { variant1Mutations: string[]; variant2Mutations: string[]; shared: string[] } = {
    variant1Mutations: [],
    variant2Mutations: [],
    shared: [],
  };

  for (const item of filteredData) {
    allMutations.variant1Mutations.push(...item.onlyVariant1);
    allMutations.variant2Mutations.push(...item.onlyVariant2);
    allMutations.shared.push(...item.shared);
  }

  return (
    <>
      <div>
        A mutation is considered as belonging to a variant if at least{' '}
        <OverlayTrigger
          trigger='click'
          overlay={
            <Tooltip id='mutationMinProportion'>
              <div>
                <Slider
                  value={Math.round(minProportion * 100)}
                  min={5}
                  max={100}
                  step={5}
                  onChange={value => setMinProportion(value / 100)}
                  style={{ width: '100px' }}
                />
              </div>
            </Tooltip>
          }
          rootClose={true}
          placement='bottom'
        >
          <span className='cursor-pointer px-3 rounded bg-gray-100 hover:bg-gray-300 font-bold'>
            {(minProportion * 100).toFixed(0)}%
          </span>
        </OverlayTrigger>{' '}
        of the samples of the variant have the mutation.
      </div>
      <p>
        * Clicking to the number of the mutations inside the diagram will copy the mutations to clipboard.{' '}
      </p>

      <div>
        <FormControl sx={{ m: 1, width: 300 }}>
          <InputLabel id='demo-multiple-checkbox-label'>Select genes</InputLabel>
          <Select
            labelId='demo-multiple-checkbox-label'
            id='demo-multiple-checkbox'
            multiple
            value={geneName}
            onChange={handleChange}
            input={<OutlinedInput label='Select genes' />}
            renderValue={selected => selected.join(', ')}
            MenuProps={MenuProps}
            placeholder='All'
          >
            {ReferenceGenomeService.genes.sort().map(gene => (
              <MenuItem key={gene} value={gene}>
                <Checkbox checked={geneName.indexOf(gene) > -1} />
                <ListItemText primary={gene} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <p>* If nothing is chosen, all genes will be shown</p>
      </div>

      <PlotContainer ref={ref} width={width ? width : 600}>
        <svg
          width='370'
          height='370'
          version='1.1'
          id='Layer_1'
          x='0px'
          y='0px'
          viewBox='0 0 910 577'
          xmlns='http://www.w3.org/2000/svg'
          className='svgPlot'
        >
          <g>
            <path
              className='st0'
              d='M562.05,172.22c15.54,36.74,23.42,75.75,23.42,115.97s-7.88,79.24-23.42,115.97 c-15.01,35.48-36.49,67.34-63.85,94.7c-9.07,9.07-18.64,17.49-28.67,25.25c44.2,28.87,96.96,45.67,153.58,45.67 c155.27,0,281.59-126.32,281.59-281.59S778.39,6.61,623.12,6.61c-56.62,0-109.38,16.8-153.58,45.67 c10.03,7.76,19.6,16.18,28.67,25.25C525.57,104.88,547.05,136.75,562.05,172.22z'
            />
            <path
              className='st0'
              d='M348.61,404.17c-15.54-36.74-23.42-75.75-23.42-115.97c0-40.22,7.88-79.23,23.42-115.97 c15.01-35.48,36.49-67.34,63.85-94.7c9.07-9.07,18.64-17.49,28.67-25.25c-44.2-28.87-96.96-45.67-153.58-45.67 C132.27,6.61,5.95,132.93,5.95,288.19s126.32,281.59,281.59,281.59c56.62,0,109.38-16.8,153.58-45.67 c-10.03-7.76-19.6-16.18-28.67-25.25C385.09,471.5,363.61,439.64,348.61,404.17z'
            />
            <path
              className='st0'
              d='M569.13,288.19c0-92.45-44.78-174.63-113.8-226c-69.01,51.37-113.8,133.55-113.8,226s44.78,174.63,113.8,226 C524.34,462.83,569.13,380.64,569.13,288.19z'
            />
          </g>
          <text
            onClick={() => {
              navigator.clipboard.writeText(
                `${allMutations.variant1Mutations.length ? allMutations.variant1Mutations.join(', ') : ''}`
              );
            }}
            transform='matrix(1 0 0 1 154.6328 294.3799)'
            className='st1 st2 svgPlotNumber'
            data-for='variant1'
            data-tip
          >
            {allMutations.variant1Mutations.length}
          </text>
          <text
            onClick={() => {
              navigator.clipboard.writeText(
                `${allMutations.shared.length ? allMutations.shared.join(', ') : ''}`
              );
            }}
            transform='matrix(1 0 0 1 427.6328 294.3799)'
            className='st1 st2 svgPlotNumber'
            data-for='shared'
            data-tip
          >
            {allMutations.shared.length}
          </text>
          <text
            onClick={() => {
              navigator.clipboard.writeText(
                `${allMutations.variant2Mutations.length ? allMutations.variant2Mutations.join(', ') : ''}`
              );
            }}
            transform='matrix(1 0 0 1 712.6328 294.3799)'
            className='st1 st2 svgPlotNumber'
            data-for='variant2'
            data-tip
          >
            {allMutations.variant2Mutations.length}
          </text>
          <text x='8.785' y='37.948' className='svgPlotText'>
            {variants ? variants[0].pangoLineage : null}
          </text>
          <text x='777.125' y='31.79' className='svgPlotText'>
            {variants ? variants[1].pangoLineage : null}
          </text>
        </svg>
        <>
          <ReactTooltip id='variant1' key='variant1'>
            {allMutations.variant1Mutations.length
              ? MutationListFormat(allMutations.variant1Mutations)
              : `no mutations in ${variants ? variants[0].pangoLineage : null}`}
          </ReactTooltip>
          <ReactTooltip id='shared' key='shared'>
            {allMutations.shared.length ? MutationListFormat(allMutations.shared) : 'no shared mutations'}
          </ReactTooltip>
          <ReactTooltip id='variant2' key='variant2'>
            {allMutations.variant2Mutations.length
              ? MutationListFormat(allMutations.variant2Mutations)
              : `no mutations in ${variants ? variants[1].pangoLineage : null}`}
          </ReactTooltip>
        </>
      </PlotContainer>
    </>
  );
};

function MutationListFormat(mutations: string[]): JSX.Element {
  // Up to five mutations shall be shown on a line.
  let currentLine: string[] = [];
  const lines: string[][] = [currentLine];
  for (let mutation of mutations.sort()) {
    currentLine.push(mutation);
    if (currentLine.length >= 5) {
      currentLine = [];
      lines.push(currentLine);
    }
  }
  return (
    <>
      {lines.map((line, index) => (
        <div key={index}>{line.join(', ')}</div>
      ))}
    </>
  );
}
