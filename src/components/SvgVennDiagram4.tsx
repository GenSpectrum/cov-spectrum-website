import { LapisSelector } from '../data/LapisSelector';
import { useState, useEffect, useMemo } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import styled from 'styled-components';
import { useQuery } from '../helpers/query-hook';
import { useExploreUrl } from '../helpers/explore-url';
import { MutationProportionData } from '../data/MutationProportionDataset';
import Loader from './Loader';
import './style/svgPlots.css';
import { ReferenceGenomeService } from '../services/ReferenceGenomeService';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import Slider from 'rc-slider';
import { vennIntersections } from '../helpers/intersections';

import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import ReactTooltip from 'react-tooltip';
import { Utils } from '../services/Utils';

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

interface PlotContProps {
  width: number;
}
const PlotContainer = styled.div<PlotContProps>`
  overflow: ${props => (props.width < 500 ? 'scroll' : 'auto')};
`;

type Venn4Data = {
  variant1Mutations: string[];
  variant2Mutations: string[];
  variant3Mutations: string[];
  variant4Mutations: string[];
  shared: string[];
  shared1and2: string[];
  shared1and3: string[];
  shared1and4: string[];
  shared2and3: string[];
  shared2and4: string[];
  shared3and4: string[];
  shared1and2and3: string[];
  shared1and2and4: string[];
  shared2and3and4: string[];
  shared1and4and3: string[];
};

export const SvgVennDiagram4 = ({ selectors }: Props) => {
  const [geneName, setGeneName] = useState<string[]>([]);
  const [minProportion, setMinProportion] = useState(0.5);

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

  const res = useQuery(
    signal => Promise.all(selectors.map(selector => MutationProportionData.fromApi(selector, 'aa', signal))),
    [selectors],
    useEffect
  );

  const exploreUrl = useExploreUrl()!;
  const variants = exploreUrl.variants;

  const data = useMemo(() => {
    if (!res.data || res.data.length !== 4) {
      return undefined;
    }

    if (res.data && res.data.length === 4) {
      const [variant1, variant2, variant3, variant4] = res.data;

      const variant1Mutations = variant1.payload
        .filter(m => m.proportion >= minProportion)
        .map(m => m.mutation);
      const variant2Mutations = variant2.payload
        .filter(m => m.proportion >= minProportion)
        .map(m => m.mutation);
      const variant3Mutations = variant3.payload
        .filter(m => m.proportion >= minProportion)
        .map(m => m.mutation);
      const variant4Mutations = variant4.payload
        .filter(m => m.proportion >= minProportion)
        .map(m => m.mutation);

      return vennIntersections(variant1Mutations, variant2Mutations, variant3Mutations, variant4Mutations);
    }
  }, [res.data, minProportion]);

  // Filter the mutations by gene
  const filteredData = useMemo(() => {
    if (!data) {
      return undefined;
    }
    if (geneName.length > 0) {
      return data.map(old => ({
        ...old,
        values: old.values.filter(value => geneName.includes(value.split(':')[0])),
      }));
    }
    return data;
  }, [data, geneName]);

  // Transform the general VennIntersectionsResult object to Venn2Data.
  const venn4Data: Venn4Data | undefined = useMemo(() => {
    if (!filteredData) {
      return undefined;
    }
    const findSet = (variants: number[]): string[] =>
      filteredData.find(({ indicesOfSets }) => Utils.setEquals(new Set(variants), new Set(indicesOfSets)))
        ?.values ?? [];
    return {
      variant1Mutations: findSet([0]),
      variant2Mutations: findSet([1]),
      variant3Mutations: findSet([2]),
      variant4Mutations: findSet([3]),
      shared: findSet([0, 1, 2, 3]),
      shared1and2: findSet([0, 1]),
      shared1and3: findSet([0, 2]),
      shared1and4: findSet([0, 3]),
      shared2and3: findSet([1, 2]),
      shared2and4: findSet([1, 3]),
      shared3and4: findSet([2, 3]),
      shared1and2and3: findSet([0, 1, 2]),
      shared1and2and4: findSet([0, 1, 3]),
      shared2and3and4: findSet([1, 2, 3]),
      shared1and4and3: findSet([0, 2, 3]),
    };
  }, [filteredData]);

  if (selectors.length !== 4) {
    throw new Error(
      `<VariantMutationComparison> is used with ${selectors.length} variants, ` +
        'but this component only supports comparisons of 4  variants.'
    );
  }
  if (res.isError) {
    throw new Error('Data fetching failed: ' + JSON.stringify(res.error));
  }

  if (res.isLoading || !res.data || !venn4Data) {
    return <Loader />;
  }

  return (
    <>
      {variants && variants.length === 4 && venn4Data && (
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
              width='700'
              height='700'
              version='1.1'
              id='Layer_1'
              xmlns='http://www.w3.org/2000/svg'
              x='0px'
              y='0px'
              viewBox='0 0 1366 768'
              className='svgPlot4'
            >
              <path
                className='st2_4'
                d='M575.14,385.77c-27.32,32.62-47.17,65.94-58.14,96.2c19.01,14.69,38.3,27.24,57.2,37.4
	c19.41-10.29,39.25-23.09,58.8-38.18C621.97,451.13,602.23,418.1,575.14,385.77z'
              />
              <path
                className='st2_4'
                d='M527.96,341.72c-12.34-12.34-25.03-23.67-37.83-33.91c-26.11,28.2-46.98,57.73-61.7,86.01
	c12.87,17.53,27.81,34.99,44.63,51.81c11.32,11.32,22.94,21.78,34.66,31.34c10.4-30.26,29.22-63.58,55.12-96.2
	C552.34,367.55,540.69,354.45,527.96,341.72z'
              />
              <path
                className='st2_4'
                d='M503.3,553.92c19.52-4.68,40.79-13.34,62.64-25.56c-17.92-10.16-36.2-22.7-54.22-37.4
	C503.68,514.36,500.66,535.93,503.3,553.92z'
              />
              <path
                className='st2_4'
                d='M716.64,394.64c-14.79-28.12-35.63-57.44-61.62-85.42c-12.62,10.13-25.13,21.32-37.3,33.49
	c-12.73,12.73-24.38,25.83-34.88,39.05c25.68,32.33,44.4,65.36,54.85,95.42c11.82-9.62,23.52-20.15,34.93-31.56
	C689.18,429.07,703.91,411.89,716.64,394.64z'
              />
              <path
                className='st2_4'
                d='M642.23,554.89c2.92-18.38-0.16-40.58-8.55-64.69c-18.53,15.08-37.33,27.89-55.73,38.17
	C600.38,541.08,622.22,550.07,642.23,554.89z'
              />
              <path
                className='st2_4'
                d='M361.78,235.45c-6.08,38.3,13.82,93.13,53.64,147.36c14.73-28.28,35.6-57.81,61.7-86.01
	C437.54,265.14,396.85,243.89,361.78,235.45z'
              />
              <path
                className='st2_4'
                d='M779.04,238.42c-35.25,8.45-76.21,29.87-116.02,61.82c25.99,27.98,46.83,57.29,61.62,85.41
	C764.53,331.59,784.67,276.86,779.04,238.42z'
              />
              <path
                className='st2_4'
                d='M571.84,368.77c10.5-13.22,22.15-26.32,34.88-39.05c12.17-12.17,24.68-23.36,37.3-33.49
	c-3.9-4.2-7.92-8.38-12.05-12.51c-19.71-19.71-40.3-36.84-60.84-51.07c-20.06,14.03-40.15,30.82-59.4,50.07
	c-4.32,4.32-8.51,8.69-12.58,13.09c12.8,10.24,25.49,21.57,37.83,33.91C549.69,342.45,561.34,355.55,571.84,368.77z'
              />
              <path
                className='st2_4'
                d='M509.29,563.92c2,13.67,7.26,25.29,16.05,34.08c10.28,10.28,24.41,15.72,41.18,16.78
	c0.48,0.03,0.97,0.05,1.45,0.07c0.48,0.02,0.96,0.05,1.44,0.06c0.67,0.02,1.33,0.03,1.99,0.04c0.48,0.01,0.96,0.01,1.44,0.01
	c0.48,0,0.96-0.01,1.44-0.01c0.66-0.01,1.32-0.02,1.99-0.04c0.48-0.02,0.96-0.04,1.44-0.06c0.48-0.02,0.96-0.05,1.45-0.07
	c16.77-1.06,30.91-6.51,41.18-16.78c8.58-8.58,13.79-19.86,15.89-33.11c-20.01-4.82-41.86-13.8-64.29-26.52
	C550.09,550.59,528.81,559.24,509.29,563.92z'
              />
              <path
                className='st2_4'
                d='M501.71,487.27c-11.73-9.8-23.34-20.53-34.66-32.14c-16.82-17.25-31.76-35.15-44.63-53.12
	c-29.15,57.4-34.22,109.77-8.09,136.57c17.31,17.75,45.58,21.46,78.96,13.25C490.66,533.36,493.67,511.25,501.71,487.27z'
              />
              <path
                className='st2_4'
                d='M678.62,453.64c-11.41,11.64-23.11,22.38-34.93,32.2c8.39,24.6,11.46,47.24,8.54,65.99
	c33.45,8.21,61.77,4.54,79.11-13.14c26.31-26.84,20.99-79.48-8.7-137.04C709.91,419.23,695.18,436.75,678.62,453.64z'
              />
              <path
                className='st2_4'
                d='M657.93,284.22c39.82-29.78,80.8-49.75,116.07-57.63c-2-12.74-7.25-23.57-16.04-31.77
	c-32.24-30.04-102.43-15.86-172.96,30.12c20.55,13.27,41.15,29.24,60.87,47.61C650,276.42,654.02,280.31,657.93,284.22z'
              />
              <path
                className='st2_4'
                d='M500.17,272.38c20.04-18.28,40.95-34.21,61.83-47.54c-72.87-46.06-145.14-60.11-178.46-29.72
	c-8.93,8.15-14.35,18.85-16.54,31.44c36.5,8.01,78.86,28.18,120.07,58.25C491.3,280.63,495.67,276.48,500.17,272.38z'
              />
              <path
                className='st2_4'
                d='M485.21,563.92c-36.35,8.98-67.13,4.93-85.98-14.5c-28.45-29.33-22.93-86.65,8.81-149.47
	c-43.36-60.86-65.03-122.39-58.41-165.37c-36.42-9.03-67.26-4.99-86.14,14.46c-45.07,46.45-4.91,163.16,89.7,260.67
	C418.63,577.16,492.98,617.75,547.52,621c-18.26-1.19-33.65-7.3-44.84-18.83C493.11,592.3,487.39,579.26,485.21,563.92z'
              />
              <path
                className='st2_4'
                d='M735.74,398.24c32.04,62.62,37.78,119.89,9.39,149.09c-18.71,19.24-49.28,23.23-85.38,14.3
	c-2.27,14.71-7.89,27.22-17.15,36.74c-11.09,11.4-26.35,17.45-44.45,18.62c54.06-3.22,127.75-43.35,192.61-110.04
	c93.78-96.42,133.58-211.83,88.91-257.76c-18.68-19.21-49.19-23.22-85.21-14.34C800.53,277.52,778.8,338.26,735.74,398.24z'
              />
              <text
                transform='matrix(1 0 0 1 441.3496 234.874)'
                className='st3 st4 svgPlotNumber'
                data-for='variant1'
                data-tip
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${venn4Data.variant1Mutations.length ? venn4Data.variant1Mutations.join(', ') : ''}`
                  );
                }}
              >
                {venn4Data.variant1Mutations.length}
              </text>
              <text
                transform='matrix(1 0 0 1 676.3496 228.874)'
                className='st3 st4 svgPlotNumber'
                data-for='variant2'
                data-tip
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${venn4Data.variant2Mutations.length ? venn4Data.variant2Mutations.join(', ') : ''}`
                  );
                }}
              >
                {venn4Data.variant2Mutations.length}
              </text>
              <text
                transform='matrix(1 0 0 1 399.3496 311.874)'
                className='st3 st4 svgPlotNumber'
                data-for='shared1and3'
                data-tip
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${venn4Data.shared1and3.length ? venn4Data.shared1and3.join(', ') : ''}`
                  );
                }}
              >
                {venn4Data.shared1and3.length}
              </text>
              <text
                transform='matrix(1 0 0 1 556.3496 311.874)'
                className='st3 st4 svgPlotNumber'
                data-for='shared1and2'
                data-tip
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${venn4Data.shared1and2.length ? venn4Data.shared1and2.join(', ') : ''}`
                  );
                }}
              >
                {venn4Data.shared1and2.length}
              </text>
              <text
                transform='matrix(1 0 0 1 718.3496 311.874)'
                className='st3 st4 svgPlotNumber'
                data-for='shared2and4'
                data-tip
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${venn4Data.shared2and4.length ? venn4Data.shared2and4.join(', ') : ''}`
                  );
                }}
              >
                {venn4Data.shared2and4.length}
              </text>
              <text
                transform='matrix(1 0 0 1 297.3496 373.874)'
                className='st3 st4 svgPlotNumber'
                data-for='variant3'
                data-tip
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${venn4Data.variant3Mutations.length ? venn4Data.variant3Mutations.join(', ') : ''}`
                  );
                }}
              >
                {venn4Data.variant3Mutations.length}
              </text>
              <text
                transform='matrix(1 0 0 1 818.3496 378.874)'
                className='st3 st4 svgPlotNumber'
                data-for='variant4'
                data-tip
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${venn4Data.variant4Mutations.length ? venn4Data.variant4Mutations.join(', ') : ''}`
                  );
                }}
              >
                {venn4Data.variant4Mutations.length}
              </text>
              <text
                transform='matrix(1 0 0 1 483.3496 401.874)'
                className='st3 st4 svgPlotNumber'
                data-for='shared1and2and3'
                data-tip
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${venn4Data.shared1and2and3.length ? venn4Data.shared1and2and3.join(', ') : ''}`
                  );
                }}
              >
                {venn4Data.shared1and2and3.length}
              </text>
              <text
                transform='matrix(1 0 0 1 643.3496 401.874)'
                className='st3 st4 svgPlotNumber'
                data-for='shared1and2and4'
                data-tip
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${venn4Data.shared1and2and4.length ? venn4Data.shared1and2and4.join(', ') : ''}`
                  );
                }}
              >
                {venn4Data.shared1and2and4.length}
              </text>
              <text
                transform='matrix(1 0 0 1 428.3496 508.874)'
                className='st3 st4 svgPlotNumber'
                data-for='shared2and3'
                data-tip
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${venn4Data.shared2and3.length ? venn4Data.shared2and3.join(', ') : ''}`
                  );
                }}
              >
                {venn4Data.shared2and3.length}
              </text>
              <text
                transform='matrix(1 0 0 1 683.3496 508.874)'
                className='st3 st4 svgPlotNumber'
                data-for='shared1and4'
                data-tip
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${venn4Data.shared1and4.length ? venn4Data.shared1and4.join(', ') : ''}`
                  );
                }}
              >
                {venn4Data.shared1and4.length}
              </text>
              <text
                transform='matrix(1 0 0 1 554.3496 465.874)'
                className='st3 st4 svgPlotNumber'
                data-for='shared'
                data-tip
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${venn4Data.shared.length ? venn4Data.shared.join(', ') : ''}`
                  );
                }}
              >
                {venn4Data.shared.length}
              </text>
              <text
                transform='matrix(1 0 0 1 505.3496 537.874)'
                className='st3 st4 svgPlotNumber'
                data-for='shared2and3and4'
                data-tip
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${venn4Data.shared1and2and4.length ? venn4Data.shared2and3and4.join(', ') : ''}`
                  );
                }}
              >
                {' '}
                {venn4Data.shared2and3and4.length}
              </text>
              <text
                transform='matrix(1 0 0 1 598.3496 537.874)'
                className='st3 st4 svgPlotNumber'
                data-for='shared1and4and3'
                data-tip
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${venn4Data.shared1and4and3.length ? venn4Data.shared1and4and3.join(', ') : ''}`
                  );
                }}
              >
                {' '}
                {venn4Data.shared2and3and4.length}
              </text>
              <text
                transform='matrix(1 0 0 1 551.3496 591.874)'
                className='st3 st4 svgPlotNumber'
                data-for='shared3and4'
                data-tip
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${venn4Data.shared3and4.length ? venn4Data.shared3and4.join(', ') : ''}`
                  );
                }}
              >
                {venn4Data.shared3and4.length}
              </text>
              <text transform='matrix(1 0 0 1 758.7764 174.9609)' className='st3 st5 svgPlotText'>
                {variants ? variants[1].pangoLineage : null}
              </text>
              <text transform='matrix(1 0 0 1 321.7764 174.9609)' className='st3 st5 svgPlotText'>
                {variants ? variants[0].pangoLineage : null}
              </text>
              <text transform='matrix(1 0 0 1 143.7764 242.9609)' className='st3 st5 svgPlotText'>
                {variants ? variants[2].pangoLineage : null}
              </text>
              <text transform='matrix(1 0 0 1 912.7764 242.9609)' className='st3 st5 svgPlotText'>
                {variants ? variants[3].pangoLineage : null}
              </text>
            </svg>

            <>
              <ReactTooltip id='variant1' key='variant1'>
                {venn4Data.variant1Mutations.length
                  ? MutationListFormat(venn4Data.variant1Mutations)
                  : `no mutations in ${variants ? variants[0].pangoLineage : null}`}
              </ReactTooltip>
              <ReactTooltip id='shared' key='shared'>
                {venn4Data.shared.length ? MutationListFormat(venn4Data.shared) : 'no shared mutations'}
              </ReactTooltip>
              <ReactTooltip id='variant2' key='variant2'>
                {venn4Data.variant2Mutations.length
                  ? MutationListFormat(venn4Data.variant2Mutations)
                  : `no mutations in ${variants ? variants[1].pangoLineage : null}`}
              </ReactTooltip>
              <ReactTooltip id='variant3' key='variant3'>
                {venn4Data.variant3Mutations.length
                  ? MutationListFormat(venn4Data.variant3Mutations)
                  : `no mutations in ${variants ? variants[2].pangoLineage : null}`}
              </ReactTooltip>
              <ReactTooltip id='variant4' key='variant4'>
                {venn4Data.variant4Mutations.length
                  ? MutationListFormat(venn4Data.variant4Mutations)
                  : `no mutations in ${variants ? variants[3].pangoLineage : null}`}
              </ReactTooltip>
              <ReactTooltip id='shared1and2' key='shared1and2'>
                {venn4Data.shared1and2.length
                  ? MutationListFormat(venn4Data.shared1and2)
                  : `no shared mutations in ${variants ? variants[0].pangoLineage : null} and ${
                      variants ? variants[1].pangoLineage : null
                    }`}
              </ReactTooltip>
              <ReactTooltip id='shared1and3' key='shared1and3'>
                {venn4Data.shared1and3.length
                  ? MutationListFormat(venn4Data.shared1and3)
                  : `no shared mutations in ${variants ? variants[0].pangoLineage : null} and ${
                      variants ? variants[2].pangoLineage : null
                    }`}
              </ReactTooltip>
              <ReactTooltip id='shared2and3' key='shared2and3'>
                {venn4Data.shared2and3.length
                  ? MutationListFormat(venn4Data.shared2and3)
                  : `no shared mutations in ${variants ? variants[1].pangoLineage : null} and ${
                      variants ? variants[2].pangoLineage : null
                    }`}
              </ReactTooltip>
              <ReactTooltip id='shared2and4' key='shared2and4'>
                {venn4Data.shared2and4.length
                  ? MutationListFormat(venn4Data.shared2and4)
                  : `no shared mutations in ${variants ? variants[1].pangoLineage : null} and ${
                      variants ? variants[3].pangoLineage : null
                    }`}
              </ReactTooltip>
              <ReactTooltip id='shared1and4' key='shared1and4'>
                {venn4Data.shared1and4.length
                  ? MutationListFormat(venn4Data.shared1and4)
                  : `no shared mutations in ${variants ? variants[0].pangoLineage : null} and ${
                      variants ? variants[3].pangoLineage : null
                    }`}
              </ReactTooltip>
              <ReactTooltip id='shared3and4' key='shared3and4'>
                {venn4Data.shared3and4.length
                  ? MutationListFormat(venn4Data.shared3and4)
                  : `no shared mutations in ${variants ? variants[2].pangoLineage : null} and ${
                      variants ? variants[3].pangoLineage : null
                    }`}
              </ReactTooltip>
              <ReactTooltip id='shared1and2and3' key='shared1and2and3'>
                {venn4Data.shared1and2and3.length
                  ? MutationListFormat(venn4Data.shared1and2and3)
                  : `no shared mutations in ${variants ? variants[0].pangoLineage : null}, ${
                      variants ? variants[1].pangoLineage : null
                    } and ${variants ? variants[2].pangoLineage : null}`}
              </ReactTooltip>
              <ReactTooltip id='shared1and2and4' key='shared1and2and4'>
                {venn4Data.shared1and2and4.length
                  ? MutationListFormat(venn4Data.shared1and2and4)
                  : `no shared mutations in ${variants ? variants[0].pangoLineage : null}, ${
                      variants ? variants[1].pangoLineage : null
                    } and ${variants ? variants[3].pangoLineage : null}`}
              </ReactTooltip>
              <ReactTooltip id='shared2and3and4' key='shared2and3and4'>
                {venn4Data.shared2and3and4.length
                  ? MutationListFormat(venn4Data.shared2and3and4)
                  : `no shared mutations in ${variants ? variants[1].pangoLineage : null}, ${
                      variants ? variants[2].pangoLineage : null
                    } and ${variants ? variants[3].pangoLineage : null}`}
              </ReactTooltip>
              <ReactTooltip id='shared1and4and3' key='shared1and4and3'>
                {venn4Data.shared1and4and3.length
                  ? MutationListFormat(venn4Data.shared1and4and3)
                  : `no shared mutations in ${variants ? variants[0].pangoLineage : null}, ${
                      variants ? variants[2].pangoLineage : null
                    } and ${variants ? variants[3].pangoLineage : null}`}
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
