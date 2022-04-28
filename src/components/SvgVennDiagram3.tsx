import { useExploreUrl } from '../helpers/explore-url';
import ReactTooltip from 'react-tooltip';
import { LapisSelector } from '../data/LapisSelector';
import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '../helpers/query-hook';
import { MutationProportionData } from '../data/MutationProportionDataset';
import _ from 'lodash';
import { ReferenceGenomeService } from '../services/ReferenceGenomeService';
import Loader from './Loader';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import Slider from 'rc-slider';
import { useResizeDetector } from 'react-resize-detector';
import styled from 'styled-components';
import './style/svgPlots.css';

import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';

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

export interface Props {
  selectors: LapisSelector[];
}

export const SvgVennDiagram3 = ({ selectors }: Props) => {
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

  interface PlotContProps {
    width: number;
  }

  const PlotContainer = styled.div<PlotContProps>`
    overflow: ${props => (props.width < 500 ? 'scroll' : 'auto')};
  `;

  const [minProportion, setMinProportion] = useState(0.5);

  const res = useQuery(
    signal => Promise.all(selectors.map(selector => MutationProportionData.fromApi(selector, 'aa', signal))),
    [selectors],
    useEffect
  );

  const exploreUrl = useExploreUrl()!;
  const variants = exploreUrl.variants;

  const data3 = useMemo(() => {
    if (!res.data || res.data.length !== 3) {
      return undefined;
    }
    if (res.data && res.data.length === 3) {
      const [variant1, variant2, variant3] = res.data;

      const variant1Mutations = variant1.payload
        .filter(m => m.proportion >= minProportion)
        .map(m => m.mutation);
      const variant2Mutations = variant2.payload
        .filter(m => m.proportion >= minProportion)
        .map(m => m.mutation);
      const variant3Mutations = variant3.payload
        .filter(m => m.proportion >= minProportion)
        .map(m => m.mutation);
      const shared = _.intersection(variant1Mutations, variant2Mutations, variant3Mutations);

      let shared1and2 = _.intersection(variant1Mutations, variant2Mutations); // [ ...new Set([shared, shared1and3, shared2and3].flat())]
      let shared1and3 = _.intersection(variant1Mutations, variant3Mutations); //
      let shared2and3 = _.intersection(variant2Mutations, variant3Mutations);

      shared1and2 = _.pullAll(shared1and2, [...new Set([shared, shared1and3, shared2and3].flat())]);
      shared1and3 = _.pullAll(shared1and3, [...new Set([shared, shared1and2, shared2and3].flat())]);
      shared2and3 = _.pullAll(shared2and3, [...new Set([shared, shared1and3, shared1and2].flat())]);

      const onlyVariant1 = _.pullAll(variant1Mutations, [
        ...new Set([shared, shared1and2, shared1and3].flat()),
      ]);
      const onlyVariant2 = _.pullAll(variant2Mutations, [
        ...new Set([shared, shared1and2, shared2and3].flat()),
      ]);
      const onlyVariant3 = _.pullAll(variant3Mutations, [
        ...new Set([shared, shared2and3, shared1and3].flat()),
      ]);

      // Group by genes
      const genes = new Map<
        string,
        {
          onlyVariant1: string[];
          onlyVariant2: string[];
          onlyVariant3: string[];
          shared: string[];
          shared1and2: string[];
          shared1and3: string[];
          shared2and3: string[];
        }
      >();
      for (let gene of ReferenceGenomeService.genes) {
        genes.set(gene, {
          onlyVariant1: [],
          onlyVariant2: [],
          onlyVariant3: [],
          shared: [],
          shared1and2: [],
          shared1and3: [],
          shared2and3: [],
        });
      }
      for (let mutation of shared) {
        genes.get(mutation.split(':')[0])!.shared.push(mutation);
      }
      for (let mutation of shared1and2) {
        genes.get(mutation.split(':')[0])!.shared1and2.push(mutation);
      }
      for (let mutation of shared1and3) {
        genes.get(mutation.split(':')[0])!.shared1and3.push(mutation);
      }
      for (let mutation of shared2and3) {
        genes.get(mutation.split(':')[0])!.shared2and3.push(mutation);
      }
      for (let mutation of onlyVariant1) {
        genes.get(mutation.split(':')[0])!.onlyVariant1.push(mutation);
      }
      for (let mutation of onlyVariant2) {
        genes.get(mutation.split(':')[0])!.onlyVariant2.push(mutation);
      }
      for (let mutation of onlyVariant3) {
        genes.get(mutation.split(':')[0])!.onlyVariant3.push(mutation);
      }
      // Count
      return [...genes.entries()].map(([gene, muts]) => ({
        gene,
        ...muts,
      }));
    }
  }, [res.data, minProportion]);

  if (selectors.length !== 3) {
    throw new Error(
      `<VariantMutationComparison> is used with ${selectors.length} variants, ` +
        'but this component only supports comparisons of 3  variants.'
    );
  }
  if (res.isError) {
    throw new Error('Data fetching failed: ' + JSON.stringify(res.error));
  }
  if (res.isLoading || !res.data || !data3) {
    return <Loader />;
  }

  let filteredData: typeof data3 = data3;

  if (geneName.length > 0) {
    filteredData = data3.filter(item => geneName.includes(item.gene));
    console.log('filteredData', filteredData);
  }

  let allMutations: {
    variant1Mutations: string[];
    variant2Mutations: string[];
    variant3Mutations: string[];
    shared: string[];
    shared1and2: string[];
    shared1and3: string[];
    shared2and3: string[];
  } = {
    variant1Mutations: [],
    variant2Mutations: [],
    variant3Mutations: [],
    shared: [],
    shared1and2: [],
    shared1and3: [],
    shared2and3: [],
  };

  for (const item of filteredData) {
    allMutations.variant1Mutations.push(...item.onlyVariant1);
    allMutations.variant2Mutations.push(...item.onlyVariant2);
    allMutations.variant3Mutations.push(...item.onlyVariant3);
    allMutations.shared.push(...item.shared);
    allMutations.shared1and2.push(...item.shared1and2);
    allMutations.shared1and3.push(...item.shared1and3);
    allMutations.shared2and3.push(...item.shared2and3);
  }

  return (
    <>
      {variants && variants.length === 3 && data3 && (
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
              xmlns='http://www.w3.org/2000/svg'
              x='0px'
              y='0px'
              viewBox='0 0 1178.62 1127.39'
              className='svgPlot3'
            >
              <g>
                <path
                  className='st0'
                  d='M918.61,617.78c-14.38,21.28-30.89,41.3-49.08,59.48c-18.19,18.19-38.2,34.7-59.48,49.08
		c-6.31,4.27-12.76,8.35-19.31,12.25c-0.65,52.44-11.26,103.32-31.56,151.32c-10.08,23.82-22.54,46.79-37.06,68.28
		c-14.38,21.28-30.89,41.3-49.08,59.48c-18.19,18.19-38.2,34.7-59.48,49.08c-3.37,2.28-6.78,4.5-10.22,6.67
		c53.35,28.12,114.08,44.05,178.46,44.05c211.75,0,384.02-172.27,384.02-384.02c0-136.36-71.45-256.35-178.87-324.5
		c-1.88,48.64-12.37,95.85-31.28,140.55C945.59,573.32,933.12,596.29,918.61,617.78z'
                />
                <path
                  className='st0'
                  d='M497.57,1017.67c-18.19-18.19-34.7-38.2-49.08-59.48c-14.52-21.49-26.99-44.46-37.06-68.28
		c-20.3-47.99-30.91-98.87-31.56-151.32c-6.55-3.9-13-7.99-19.31-12.25c-21.28-14.38-41.3-30.89-59.48-49.08
		c-18.19-18.19-34.7-38.2-49.08-59.48c-14.52-21.49-26.99-44.46-37.06-68.28c-18.91-44.7-29.4-91.91-31.28-140.55
		C76.23,477.1,4.79,597.08,4.79,733.45c0,211.75,172.27,384.02,384.02,384.02c64.38,0,125.11-15.93,178.46-44.05
		c-3.44-2.17-6.85-4.39-10.22-6.67C535.77,1052.37,515.75,1035.86,497.57,1017.67z'
                />
                <path
                  className='st0'
                  d='M772.52,748.82c-10.05,5.3-20.32,10.17-30.76,14.59c-49.56,20.96-102.2,31.59-156.46,31.59
		c-54.26,0-106.9-10.63-156.46-31.59c-10.43-4.41-20.7-9.28-30.76-14.59c5.28,133.57,79.12,249.82,187.22,314.47
		C693.4,998.64,767.24,882.39,772.52,748.82z'
                />
                <path
                  className='st0'
                  d='M388.81,331.49c54.26,0,106.9,10.63,156.46,31.59c13.66,5.78,27.05,12.35,40.03,19.64
		c12.99-7.29,26.37-13.86,40.03-19.64c49.56-20.96,102.2-31.59,156.46-31.59c54.26,0,106.9,10.63,156.46,31.59
		c10.43,4.41,20.7,9.28,30.76,14.59C960.92,173.01,791.9,9.01,585.3,9.01s-375.62,164-383.71,368.65
		c10.05-5.3,20.32-10.17,30.76-14.59C281.9,342.12,334.55,331.49,388.81,331.49z'
                />
                <path
                  className='st0'
                  d='M603.33,393.47c3.44,2.17,6.85,4.39,10.22,6.67c21.28,14.38,41.3,30.89,59.48,49.08
		c18.19,18.19,34.7,38.2,49.08,59.48c14.52,21.49,26.99,44.46,37.06,68.28c18.91,44.7,29.4,91.91,31.28,140.55
		c106.01-67.26,176.99-185,178.83-319.15c-55.48-31.17-119.45-48.96-187.49-48.96C717.41,349.43,656.68,365.35,603.33,393.47z'
                />
                <path
                  className='st0'
                  d='M380.15,717.53c1.88-48.64,12.37-95.85,31.28-140.55c10.07-23.82,22.54-46.79,37.06-68.28
		c14.38-21.28,30.89-41.3,49.08-59.48c18.19-18.19,38.2-34.7,59.48-49.08c3.37-2.28,6.78-4.5,10.22-6.67
		c-53.35-28.12-114.08-44.05-178.46-44.05c-68.04,0-132,17.79-187.49,48.96C203.16,532.53,274.13,650.27,380.15,717.53z'
                />
                <path
                  className='st0'
                  d='M397.81,728.1c55.48,31.17,119.45,48.96,187.49,48.96c68.04,0,132-17.79,187.49-48.96
		c-1.89-137.77-76.7-258.23-187.49-324.48C474.51,469.86,399.71,590.33,397.81,728.1z'
                />
              </g>
              <text
                transform='matrix(1 0 0 1 548.3361 206.3148)'
                className='st1 st2 svgPlotNumber'
                data-for='variant1'
                data-tip
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${
                      allMutations.variant1Mutations.length ? allMutations.variant1Mutations.join(', ') : ''
                    }`
                  );
                }}
              >
                {allMutations.variant1Mutations.length}
              </text>

              <text
                transform='matrix(1 0 0 1 548.3361 620.9984)'
                className='st1 st2 svgPlotNumber'
                data-for='shared'
                data-tip
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${allMutations.shared.length ? allMutations.shared.join(', ') : ''}`
                  );
                }}
              >
                {allMutations.shared.length}
              </text>

              <text
                transform='matrix(1 0 0 1 548.3361 935.4288)'
                className='st1 st2 svgPlotNumber'
                data-for='shared2and3'
                data-tip
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${allMutations.shared2and3.length ? allMutations.shared2and3.join(', ') : ''}`
                  );
                }}
              >
                {' '}
                {allMutations.shared2and3.length}
              </text>

              <text
                transform='matrix(1 0 0 1 307.7284 511.6313)'
                className='st1 st2 svgPlotNumber'
                data-for='shared1and2'
                data-tip
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${allMutations.shared1and2.length ? allMutations.shared1and2.join(', ') : ''}`
                  );
                }}
              >
                {allMutations.shared1and2.length}
              </text>

              <text
                transform='matrix(1 0 0 1 808.9943 511.6313)'
                className='st1 st2 svgPlotNumber'
                data-for='shared1and3'
                data-tip
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${allMutations.shared1and3.length ? allMutations.shared1and3.join(', ') : ''}`
                  );
                }}
              >
                {allMutations.shared1and3.length}
              </text>

              <text
                transform='matrix(1 0 0 1 963.0196 823.3275)'
                className='st1 st2 svgPlotNumber'
                data-for='variant3'
                data-tip
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${
                      allMutations.variant3Mutations.length ? allMutations.variant3Mutations.join(', ') : ''
                    }`
                  );
                }}
              >
                {allMutations.variant3Mutations.length}
              </text>

              <text
                transform='matrix(1 0 0 1 182.8677 823.3275)'
                className='st1 st2 svgPlotNumber'
                data-for='variant2'
                data-tip
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${
                      allMutations.variant2Mutations.length ? allMutations.variant2Mutations.join(', ') : ''
                    }`
                  );
                }}
              >
                {allMutations.variant2Mutations.length}
              </text>
              <text transform='matrix(1 0 0 1 897.6821 99.9163)' className='svgPlotText'>
                {' '}
                {variants ? variants[0].pangoLineage : null}
              </text>
              <text transform='matrix(1 0 0 1 9.3525 1110.3396)' className='svgPlotText'>
                {' '}
                {variants ? variants[1].pangoLineage : null}
              </text>
              <text transform='matrix(1 0 0 1 969.281 1110.3396)' className='svgPlotText'>
                {' '}
                {variants ? variants[2].pangoLineage : null}
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
              <ReactTooltip id='variant3' key='variant3'>
                {allMutations.variant3Mutations.length
                  ? MutationListFormat(allMutations.variant3Mutations)
                  : `no mutations in ${variants ? variants[2].pangoLineage : null}`}
              </ReactTooltip>
              <ReactTooltip id='shared1and2' key='shared1and2'>
                {allMutations.shared1and2.length
                  ? MutationListFormat(allMutations.shared1and2)
                  : `no shared mutations in ${variants ? variants[0].pangoLineage : null} and ${
                      variants ? variants[1].pangoLineage : null
                    }`}
              </ReactTooltip>
              <ReactTooltip id='shared1and3' key='shared1and3'>
                {allMutations.shared1and3.length
                  ? MutationListFormat(allMutations.shared1and3)
                  : `no shared mutations in ${variants ? variants[0].pangoLineage : null} and ${
                      variants ? variants[2].pangoLineage : null
                    }`}
              </ReactTooltip>
              <ReactTooltip id='shared2and3' key='shared2and3'>
                {allMutations.shared2and3.length
                  ? MutationListFormat(allMutations.shared2and3)
                  : `no shared mutations in ${variants ? variants[1].pangoLineage : null} and ${
                      variants ? variants[2].pangoLineage : null
                    }`}
              </ReactTooltip>
            </>
          </PlotContainer>
        </>
      )}
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
