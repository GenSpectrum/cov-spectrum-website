import { Checkbox, InputLabel, ListItemText, OutlinedInput, Select, SelectChangeEvent } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import Loader from './Loader';
import { useResizeDetector } from 'react-resize-detector';
import { LapisSelector } from '../data/LapisSelector';
import { MutationProportionData } from '../data/MutationProportionDataset';
import { SequenceType } from '../data/SequenceType';
import { useExploreUrl } from '../helpers/explore-url';
import { vennIntersections } from '../helpers/intersections';
import { useQuery } from '../helpers/query-hook';
import { ReferenceGenomeService } from '../services/ReferenceGenomeService';
import { Utils } from '../services/Utils';
import MenuItem from '@mui/material/MenuItem';
import Slider from 'rc-slider';
import FormControl from '@mui/material/FormControl';
import { formatVariantDisplayName, VariantSelector } from '../data/VariantSelector';
import './style/svgPlots.css';
import { sortAAMutationList } from '../helpers/aa-mutation';
import { sortNucMutationList } from '../helpers/nuc-mutation';

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

export type VennMutationEntry = {
  variants: number[];
  mutations: string[];
  svgTransform: string;
  path: string;
};

export type VennData = VennMutationEntry[];

export interface Props {
  selectors: LapisSelector[];
  domain: SequenceType;
  numberOfvariants: number;
}

export const SvgVennDiagram = ({ selectors, domain, numberOfvariants }: Props) => {
  const [geneName, setGeneName] = useState<string[]>([]);
  const [variantIndex, setVariantIndex] = useState<number | undefined>(undefined);

  const handleChange = (event: SelectChangeEvent<typeof geneName>) => {
    const {
      target: { value },
    } = event;
    setGeneName(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value
    );
  };

  const exploreUrl = useExploreUrl()!;
  const variants = exploreUrl.variants;
  const { ref } = useResizeDetector<HTMLDivElement>();
  const [minProportion, setMinProportion] = useState(0.5);

  const res = useQuery(
    signal =>
      Promise.all(selectors.map(selector => MutationProportionData.fromApi(selector, domain, signal))),
    [selectors],
    useEffect
  );
  const data = useMemo(() => {
    if (!res.data || ![2, 3, 4].includes(res.data.length)) {
      return undefined;
    }
    let dataList = [];
    for (let item of res.data) {
      dataList.push(item.payload.filter(m => m.proportion >= minProportion).map(m => m.mutation));
    }
    return vennIntersections(...dataList);
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
  const vennGeneralData: VennData | undefined = useMemo(() => {
    if (!filteredData) {
      return undefined;
    }
    const findSet = (variants: number[]): string[] =>
      filteredData.find(({ indicesOfSets }) => Utils.setEquals(new Set(variants), new Set(indicesOfSets)))
        ?.values ?? [];
    const tmp =
      numberOfvariants === 2
        ? [
            {
              variants: [0],
              svgTransform: 'matrix(1 0 0 1 154.6328 294.3799)',
              path: 'M348.61,404.17c-15.54-36.74-23.42-75.75-23.42-115.97c0-40.22,7.88-79.23,23.42-115.97 c15.01-35.48,36.49-67.34,63.85-94.7c9.07-9.07,18.64-17.49,28.67-25.25c-44.2-28.87-96.96-45.67-153.58-45.67 C132.27,6.61,5.95,132.93,5.95,288.19s126.32,281.59,281.59,281.59c56.62,0,109.38-16.8,153.58-45.67 c-10.03-7.76-19.6-16.18-28.67-25.25C385.09,471.5,363.61,439.64,348.61,404.17z',
            },
            {
              variants: [0, 1],
              svgTransform: 'matrix(1 0 0 1 427.6328 294.3799)',
              path: 'M569.13,288.19c0-92.45-44.78-174.63-113.8-226c-69.01,51.37-113.8,133.55-113.8,226s44.78,174.63,113.8,226 C524.34,462.83,569.13,380.64,569.13,288.19z',
            },
            {
              variants: [1],
              svgTransform: 'matrix(1 0 0 1 712.6328 294.3799)',
              path: 'M562.05,172.22c15.54,36.74,23.42,75.75,23.42,115.97s-7.88,79.24-23.42,115.97 c-15.01,35.48-36.49,67.34-63.85,94.7c-9.07,9.07-18.64,17.49-28.67,25.25c44.2,28.87,96.96,45.67,153.58,45.67 c155.27,0,281.59-126.32,281.59-281.59S778.39,6.61,623.12,6.61c-56.62,0-109.38,16.8-153.58,45.67 c10.03,7.76,19.6,16.18,28.67,25.25C525.57,104.88,547.05,136.75,562.05,172.22z',
            },
          ]
        : numberOfvariants === 3
        ? [
            {
              variants: [0],
              svgTransform: 'matrix(1 0 0 1 548.3361 206.3148)',
              path: `M388.81,331.49c54.26,0,106.9,10.63,156.46,31.59c13.66,5.78,27.05,12.35,40.03,19.64
  c12.99-7.29,26.37-13.86,40.03-19.64c49.56-20.96,102.2-31.59,156.46-31.59c54.26,0,106.9,10.63,156.46,31.59
  c10.43,4.41,20.7,9.28,30.76,14.59C960.92,173.01,791.9,9.01,585.3,9.01s-375.62,164-383.71,368.65
  c10.05-5.3,20.32-10.17,30.76-14.59C281.9,342.12,334.55,331.49,388.81,331.49z`,
            },
            {
              variants: [1],
              svgTransform: 'matrix(1 0 0 1 182.8677 823.3275)',
              path: `M497.57,1017.67c-18.19-18.19-34.7-38.2-49.08-59.48c-14.52-21.49-26.99-44.46-37.06-68.28
  c-20.3-47.99-30.91-98.87-31.56-151.32c-6.55-3.9-13-7.99-19.31-12.25c-21.28-14.38-41.3-30.89-59.48-49.08
  c-18.19-18.19-34.7-38.2-49.08-59.48c-14.52-21.49-26.99-44.46-37.06-68.28c-18.91-44.7-29.4-91.91-31.28-140.55
  C76.23,477.1,4.79,597.08,4.79,733.45c0,211.75,172.27,384.02,384.02,384.02c64.38,0,125.11-15.93,178.46-44.05
  c-3.44-2.17-6.85-4.39-10.22-6.67C535.77,1052.37,515.75,1035.86,497.57,1017.67z`,
            },
            {
              variants: [2],
              svgTransform: 'matrix(1 0 0 1 963.0196 823.3275)',
              path: `M918.61,617.78c-14.38,21.28-30.89,41.3-49.08,59.48c-18.19,18.19-38.2,34.7-59.48,49.08
            c-6.31,4.27-12.76,8.35-19.31,12.25c-0.65,52.44-11.26,103.32-31.56,151.32c-10.08,23.82-22.54,46.79-37.06,68.28
            c-14.38,21.28-30.89,41.3-49.08,59.48c-18.19,18.19-38.2,34.7-59.48,49.08c-3.37,2.28-6.78,4.5-10.22,6.67
            c53.35,28.12,114.08,44.05,178.46,44.05c211.75,0,384.02-172.27,384.02-384.02c0-136.36-71.45-256.35-178.87-324.5
            c-1.88,48.64-12.37,95.85-31.28,140.55C945.59,573.32,933.12,596.29,918.61,617.78z`,
            },
            {
              variants: [0, 1, 2],
              svgTransform: 'matrix(1 0 0 1 548.3361 620.9984)',
              path: `M397.81,728.1c55.48,31.17,119.45,48.96,187.49,48.96c68.04,0,132-17.79,187.49-48.96
  c-1.89-137.77-76.7-258.23-187.49-324.48C474.51,469.86,399.71,590.33,397.81,728.1z`,
            },
            {
              variants: [0, 1],
              svgTransform: 'matrix(1 0 0 1 307.7284 511.6313)',
              path: `M380.15,717.53c1.88-48.64,12.37-95.85,31.28-140.55c10.07-23.82,22.54-46.79,37.06-68.28
  c14.38-21.28,30.89-41.3,49.08-59.48c18.19-18.19,38.2-34.7,59.48-49.08c3.37-2.28,6.78-4.5,10.22-6.67
  c-53.35-28.12-114.08-44.05-178.46-44.05c-68.04,0-132,17.79-187.49,48.96C203.16,532.53,274.13,650.27,380.15,717.53z`,
            },
            {
              variants: [0, 2],
              svgTransform: 'matrix(1 0 0 1 808.9943 511.6313)',
              path: `M603.33,393.47c3.44,2.17,6.85,4.39,10.22,6.67c21.28,14.38,41.3,30.89,59.48,49.08
  c18.19,18.19,34.7,38.2,49.08,59.48c14.52,21.49,26.99,44.46,37.06,68.28c18.91,44.7,29.4,91.91,31.28,140.55
  c106.01-67.26,176.99-185,178.83-319.15c-55.48-31.17-119.45-48.96-187.49-48.96C717.41,349.43,656.68,365.35,603.33,393.47z`,
            },
            {
              variants: [1, 2],
              svgTransform: 'matrix(1 0 0 1 548.3361 935.4288)',
              path: `M772.52,748.82c-10.05,5.3-20.32,10.17-30.76,14.59c-49.56,20.96-102.2,31.59-156.46,31.59
  c-54.26,0-106.9-10.63-156.46-31.59c-10.43-4.41-20.7-9.28-30.76-14.59c5.28,133.57,79.12,249.82,187.22,314.47
  C693.4,998.64,767.24,882.39,772.52,748.82z`,
            },
          ]
        : numberOfvariants === 4
        ? [
            {
              variants: [0],
              svgTransform: 'matrix(1 0 0 1 441.3496 234.874)',
              path: `M500.17,272.38c20.04-18.28,40.95-34.21,61.83-47.54c-72.87-46.06-145.14-60.11-178.46-29.72
    c-8.93,8.15-14.35,18.85-16.54,31.44c36.5,8.01,78.86,28.18,120.07,58.25C491.3,280.63,495.67,276.48,500.17,272.38z`,
            },
            {
              variants: [1],
              svgTransform: 'matrix(1 0 0 1 676.3496 228.874)',
              path: `M657.93,284.22c39.82-29.78,80.8-49.75,116.07-57.63c-2-12.74-7.25-23.57-16.04-31.77
    c-32.24-30.04-102.43-15.86-172.96,30.12c20.55,13.27,41.15,29.24,60.87,47.61C650,276.42,654.02,280.31,657.93,284.22z`,
            },
            {
              variants: [2],
              svgTransform: 'matrix(1 0 0 1 297.3496 373.874)',
              path: `M485.21,563.92c-36.35,8.98-67.13,4.93-85.98-14.5c-28.45-29.33-22.93-86.65,8.81-149.47
    c-43.36-60.86-65.03-122.39-58.41-165.37c-36.42-9.03-67.26-4.99-86.14,14.46c-45.07,46.45-4.91,163.16,89.7,260.67
    C418.63,577.16,492.98,617.75,547.52,621c-18.26-1.19-33.65-7.3-44.84-18.83C493.11,592.3,487.39,579.26,485.21,563.92z`,
            },
            {
              variants: [3],
              svgTransform: 'matrix(1 0 0 1 818.3496 378.874)',
              path: `M735.74,398.24c32.04,62.62,37.78,119.89,9.39,149.09c-18.71,19.24-49.28,23.23-85.38,14.3
    c-2.27,14.71-7.89,27.22-17.15,36.74c-11.09,11.4-26.35,17.45-44.45,18.62c54.06-3.22,127.75-43.35,192.61-110.04
    c93.78-96.42,133.58-211.83,88.91-257.76c-18.68-19.21-49.19-23.22-85.21-14.34C800.53,277.52,778.8,338.26,735.74,398.24z`,
            },
            {
              variants: [0, 1, 2, 3],
              svgTransform: 'matrix(1 0 0 1 554.3496 465.874)',
              path: `M575.14,385.77c-27.32,32.62-47.17,65.94-58.14,96.2c19.01,14.69,38.3,27.24,57.2,37.4
    c19.41-10.29,39.25-23.09,58.8-38.18C621.97,451.13,602.23,418.1,575.14,385.77z`,
            },
            {
              variants: [0, 1],
              svgTransform: 'matrix(1 0 0 1 556.3496 311.874)',
              path: `M571.84,368.77c10.5-13.22,22.15-26.32,34.88-39.05c12.17-12.17,24.68-23.36,37.3-33.49
    c-3.9-4.2-7.92-8.38-12.05-12.51c-19.71-19.71-40.3-36.84-60.84-51.07c-20.06,14.03-40.15,30.82-59.4,50.07
    c-4.32,4.32-8.51,8.69-12.58,13.09c12.8,10.24,25.49,21.57,37.83,33.91C549.69,342.45,561.34,355.55,571.84,368.77z`,
            },
            {
              variants: [0, 2],
              svgTransform: 'matrix(1 0 0 1 399.3496 311.874)',
              path: `M361.78,235.45c-6.08,38.3,13.82,93.13,53.64,147.36c14.73-28.28,35.6-57.81,61.7-86.01
    C437.54,265.14,396.85,243.89,361.78,235.45z`,
            },
            {
              variants: [0, 3],
              svgTransform: 'matrix(1 0 0 1 683.3496 508.874)',
              path: `M678.62,453.64c-11.41,11.64-23.11,22.38-34.93,32.2c8.39,24.6,11.46,47.24,8.54,65.99
    c33.45,8.21,61.77,4.54,79.11-13.14c26.31-26.84,20.99-79.48-8.7-137.04C709.91,419.23,695.18,436.75,678.62,453.64z`,
            },
            {
              variants: [1, 2],
              svgTransform: 'matrix(1 0 0 1 428.3496 508.874)',
              path: `M501.71,487.27c-11.73-9.8-23.34-20.53-34.66-32.14c-16.82-17.25-31.76-35.15-44.63-53.12
    c-29.15,57.4-34.22,109.77-8.09,136.57c17.31,17.75,45.58,21.46,78.96,13.25C490.66,533.36,493.67,511.25,501.71,487.27z`,
            },
            {
              variants: [1, 3],
              svgTransform: 'matrix(1 0 0 1 718.3496 311.874)',
              path: `M779.04,238.42c-35.25,8.45-76.21,29.87-116.02,61.82c25.99,27.98,46.83,57.29,61.62,85.41
    C764.53,331.59,784.67,276.86,779.04,238.42z`,
            },
            {
              variants: [2, 3],
              svgTransform: 'matrix(1 0 0 1 551.3496 591.874)',
              path: `M509.29,563.92c2,13.67,7.26,25.29,16.05,34.08c10.28,10.28,24.41,15.72,41.18,16.78
    c0.48,0.03,0.97,0.05,1.45,0.07c0.48,0.02,0.96,0.05,1.44,0.06c0.67,0.02,1.33,0.03,1.99,0.04c0.48,0.01,0.96,0.01,1.44,0.01
    c0.48,0,0.96-0.01,1.44-0.01c0.66-0.01,1.32-0.02,1.99-0.04c0.48-0.02,0.96-0.04,1.44-0.06c0.48-0.02,0.96-0.05,1.45-0.07
    c16.77-1.06,30.91-6.51,41.18-16.78c8.58-8.58,13.79-19.86,15.89-33.11c-20.01-4.82-41.86-13.8-64.29-26.52
    C550.09,550.59,528.81,559.24,509.29,563.92z`,
            },
            {
              variants: [0, 1, 2],
              svgTransform: 'matrix(1 0 0 1 483.3496 401.874)',
              path: `M527.96,341.72c-12.34-12.34-25.03-23.67-37.83-33.91c-26.11,28.2-46.98,57.73-61.7,86.01
    c12.87,17.53,27.81,34.99,44.63,51.81c11.32,11.32,22.94,21.78,34.66,31.34c10.4-30.26,29.22-63.58,55.12-96.2
    C552.34,367.55,540.69,354.45,527.96,341.72z`,
            },
            {
              variants: [0, 1, 3],
              svgTransform: 'matrix(1 0 0 1 643.3496 401.874)',
              path: `M716.64,394.64c-14.79-28.12-35.63-57.44-61.62-85.42c-12.62,10.13-25.13,21.32-37.3,33.49
    c-12.73,12.73-24.38,25.83-34.88,39.05c25.68,32.33,44.4,65.36,54.85,95.42c11.82-9.62,23.52-20.15,34.93-31.56
    C689.18,429.07,703.91,411.89,716.64,394.64z`,
            },
            {
              variants: [1, 2, 3],
              svgTransform: 'matrix(1 0 0 1 505.3496 537.874)',
              path: `M503.3,553.92c19.52-4.68,40.79-13.34,62.64-25.56c-17.92-10.16-36.2-22.7-54.22-37.4
    C503.68,514.36,500.66,535.93,503.3,553.92z`,
            },
            {
              variants: [0, 2, 3],
              svgTransform: 'matrix(1 0 0 1 598.3496 537.874)',
              path: `M642.23,554.89c2.92-18.38-0.16-40.58-8.55-64.69c-18.53,15.08-37.33,27.89-55.73,38.17
    C600.38,541.08,622.22,550.07,642.23,554.89z`,
            },
          ]
        : [];
    return tmp.map(t => ({
      ...t,
      mutations: findSet(t.variants),
    }));
  }, [filteredData, numberOfvariants]);

  if (res.isError) {
    throw new Error('Data fetching failed: ' + JSON.stringify(res.error));
  }

  if (res.isLoading || !res.data || !vennGeneralData || !variants) {
    return <Loader />;
  }

  const plotInfo = {
    venn2: { viewBox: '0 0 1600 577', className: 'svgPlot' },
    venn3: { viewBox: '0 0 1500 1127.39', className: 'svgPlot3' },
    venn4: { viewBox: '100 100 1500 550', className: 'svgPlot4' },
  };

  const paths = (
    <g>
      {vennGeneralData.map(({ path }, index) => (
        <path
          className={`st0 ${variantIndex === index ? 'hoveredCircle' : ''}`}
          d={path}
          onMouseEnter={() => setVariantIndex(index)}
          onMouseLeave={() => setVariantIndex(undefined)}
        />
      ))}
    </g>
  );

  let variantTexts3: {
    transform: string;
    variant: VariantSelector;
    className: string;
  }[] = [
    {
      transform: 'matrix(1 0 0 1 897.6821 99.9163)',
      variant: variants[0],
    },
    {
      transform: 'matrix(1 0 0 1 9.3525 1110.3396)',
      variant: variants[1],
    },
    {
      transform: 'matrix(1 0 0 1 969.281 1110.3396)',
      variant: variants[2],
    },
  ].map((t, index) => ({
    ...t,
    className: `svgPlotText ${
      variantIndex !== undefined && vennGeneralData[variantIndex].variants.includes(index) ? 'hovered' : ''
    }`,
  }));

  let variantTexts4: {
    transform: string;
    variant: VariantSelector;
    className: string;
  }[] = [
    {
      transform: 'matrix(1 0 0 1 321.7764 174.9609)',
      variant: variants[0],
    },
    {
      transform: 'matrix(1 0 0 1 758.7764 174.9609)',
      variant: variants[1],
    },
    {
      transform: 'matrix(1 0 0 1 143.7764 242.9609)',
      variant: variants[2],
    },
    {
      transform: 'matrix(1 0 0 1 912.7764 242.9609)',
      variant: variants[3],
    },
  ].map((t, index) => ({
    ...t,
    className: `svgPlotText st3 st5 ${
      variantIndex !== undefined && vennGeneralData[variantIndex].variants.includes(index) ? 'hovered' : ''
    }`,
  }));

  function showMutationText(index: number) {
    return vennGeneralData ? MutationListFormat2(vennGeneralData[index].mutations, domain) : '';
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
        of the samples of the variant have the mutation.{' '}
        <b>Click on the number of the mutations inside the diagram to copy the mutations to clipboard.</b>
      </div>

      {domain === 'aa' ? (
        <div>
          <p>You can filter the genes: if nothing is selected, all genes are included.</p>
          <FormControl sx={{ m: 1, width: 300 }} size='small'>
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
        </div>
      ) : (
        <br />
      )}

      <div ref={ref} style={{ maxWidth: '500px', margin: 'auto' }}>
        <svg
          version='1.1'
          id='Layer_1'
          x='0px'
          y='0px'
          viewBox={
            numberOfvariants === 2
              ? plotInfo.venn2.viewBox
              : numberOfvariants === 3
              ? plotInfo.venn3.viewBox
              : numberOfvariants === 4
              ? plotInfo.venn4.viewBox
              : ''
          }
          xmlns='http://www.w3.org/2000/svg'
          className={
            numberOfvariants === 2
              ? plotInfo.venn2.className
              : numberOfvariants === 3
              ? plotInfo.venn3.className
              : numberOfvariants === 4
              ? plotInfo.venn4.className
              : ''
          }
        >
          {paths}

          {vennGeneralData.map(({ svgTransform, mutations }, index) => (
            <text
              onClick={() => navigator.clipboard.writeText(mutations.join(','))}
              transform={svgTransform}
              className={`svgPlotNumber ${numberOfvariants === 4 ? 'st3 st4' : 'st1 st2'}`}
              onMouseEnter={() => setVariantIndex(index)}
              onMouseLeave={() => setVariantIndex(undefined)}
            >
              {mutations.length}
            </text>
          ))}

          {numberOfvariants === 3 ? (
            variantTexts3.map(({ transform, variant, className }) => (
              <text transform={transform} className={className}>
                {variant && formatVariantDisplayName(variant)}
              </text>
            ))
          ) : numberOfvariants === 4 ? (
            variantTexts4.map(({ transform, variant, className }) => (
              <text transform={transform} className={className}>
                {variant && formatVariantDisplayName(variant)}
              </text>
            ))
          ) : numberOfvariants === 2 ? (
            <>
              {' '}
              <text
                x='8.785'
                y='37.948'
                className={`svgPlotText ${
                  variantIndex !== undefined && vennGeneralData[variantIndex].variants.includes(0)
                    ? 'hovered'
                    : ''
                }`}
              >
                {variants[0] && formatVariantDisplayName(variants[0])}
              </text>
              <text
                x='777.125'
                y='31.79'
                className={`svgPlotText ${
                  variantIndex !== undefined && vennGeneralData[variantIndex].variants.includes(1)
                    ? 'hovered'
                    : ''
                }`}
              >
                {variants[1] && formatVariantDisplayName(variants[1])}
              </text>
            </>
          ) : (
            ''
          )}
        </svg>
      </div>
      <br />

      <div>{variantIndex !== undefined && showMutationText(variantIndex)}</div>
    </>
  );
};

export function MutationListFormat2(mutations: string[], domain: SequenceType): JSX.Element {
  let sorted: string[] = domain === 'aa' ? sortAAMutationList(mutations) : sortNucMutationList(mutations);
  return (
    <>
      {' '}
      <div>
        {' '}
        <span style={{ fontWeight: 'bold', color: 'blue' }}> {'Mutations: '} </span>
        {sorted.length > 0 ? sorted.join(', ') : '-'}
      </div>
    </>
  );
}
