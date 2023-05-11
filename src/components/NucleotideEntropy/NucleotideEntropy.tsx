import React, { useMemo, useState } from 'react';
import { MutationProportionData } from '../../data/MutationProportionDataset';
import Loader from '../Loader';
import { useQuery } from '../../helpers/query-hook';
import { MutationProportionEntry } from '../../data/MutationProportionEntry';
import { LapisSelector } from '../../data/LapisSelector';
import { PipeDividedOptionsButtons } from '../../helpers/ui';
import { NamedCard } from '../NamedCard';
import {
  Bar,
  BarChart,
  Brush,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { SequenceType } from '../../data/SequenceType';
import { Form } from 'react-bootstrap';
import { globalDateCache, UnifiedDay } from '../../helpers/date-cache';
import { FixedDateRangeSelector } from '../../data/DateRangeSelector';
import { DateRange } from '../../data/DateRange';
import { sortListByAAMutation } from '../../helpers/aa-mutation';
import jsonRefData from '../../data/refData.json';
import { colors } from '../../widgets/common';
import { mapLabelsToColors } from '../../helpers/colors';
import chroma from 'chroma-js';
import Select, { CSSObjectWithLabel, StylesConfig } from 'react-select';
import { getTicks } from '../../helpers/ticks';
import { formatDate } from '../../widgets/VariantTimeDistributionLineChartInner';
import { PercentageInput } from '../PercentageInput';
import { calculateEntropy, GeneOption, PositionEntropy, weeklyMeanEntropy } from './calculateEntropy';
import { CustomBar, CustomTooltip, formatXAxis, getBrushIndex } from './PlotUtils';

type Props = {
  selector: LapisSelector;
};

export type TransformedTime = {
  [x: string]: string | number | undefined;
  day: number | undefined;
}[];

type Data = {
  positionEntropy: PositionEntropy[];
  timeData: any;
  sequenceType: SequenceType;
  ticks: number[];
};

export type Gene = {
  name: string;
  startPosition: number;
  endPosition: number;
  aaSeq: string;
};

const toolTipStyle = {
  backgroundColor: 'white',
  zIndex: 1,
};

const colorStyles: Partial<StylesConfig<any, true, any>> = {
  control: (styles: CSSObjectWithLabel) => ({ ...styles, backgroundColor: 'white' }),
  multiValue: (styles: CSSObjectWithLabel, { data }: { data: GeneOption }) => {
    const color = chroma(data.color);
    return {
      ...styles,
      backgroundColor: color.alpha(0.1).css(),
    };
  },
  multiValueLabel: (styles: CSSObjectWithLabel, { data }: { data: GeneOption }) => ({
    ...styles,
    color: data.color,
  }),
  multiValueRemove: (styles: CSSObjectWithLabel, { data }: { data: GeneOption }) => {
    return {
      ...styles,
      'color': data.color,
      ':hover': {
        backgroundColor: data.color,
        color: 'white',
        cursor: 'pointer',
      },
    };
  },
};

function assignColorsToGeneOptions<T extends { label: string }>(options: T[]): (T & { color: string })[] {
  const colors = mapLabelsToColors(options.map(o => o.label));
  return options.map((o, i) => ({
    ...o,
    color: colors[i],
  }));
}

const genes = jsonRefData.genes;
!genes.map(o => o.name).includes('All') &&
  genes.push({ name: 'All', startPosition: 0, endPosition: 29903, aaSeq: '' });

export const options: GeneOption[] = assignColorsToGeneOptions(
  genes.map(g => {
    return {
      value: g.name,
      label: g.name,
      startPosition: g.startPosition,
      endPosition: g.endPosition,
      aaSeq: g.aaSeq,
      color: chroma.random().darken().hex(),
    };
  })
);

export const NucleotideEntropy = ({ selector }: Props) => {
  const [plotType, setPlotType] = useState<'overTime' | 'perPosition'>('overTime');
  const [includeDeletions, setIncludeDeletions] = useState<boolean>(false);
  const [includePositionsWithZeroEntropy, setIncludePositionsWithZeroEntropy] = useState<boolean>(false);
  const [sequenceType, setSequenceType] = useState<SequenceType>('nuc');
  const [threshold, setThreshold] = useState(0.00001);
  const [selectedGene, setSelectedGene] = useState<string>('all');
  const [selectedGeneOptions, setSelectedGenes] = useState([
    {
      value: 'All',
      label: 'All',
      color: '#353B89',
    },
  ]);

  let selectedGenes = options.filter(g => selectedGeneOptions.map(o => o.value).includes(g.value));

  const handleDeletions = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIncludeDeletions(event.target.checked);
  };

  const onChange = (value: any, { action, removedValue }: any) => {
    switch (action) {
      case 'remove-value':
      case 'pop-value':
        if (removedValue.isFixed) {
          return;
        }
        break;
      case 'clear':
        value = [{ value: 'All', label: 'All', color: '#353B89' }];
        break;
    }
    setSelectedGenes(value);
  };

  const controls = (
    <div className='mb-4'>
      <div className='mb-2 flex'>
        <PipeDividedOptionsButtons
          options={[
            { label: 'Nucleotides', value: 'nuc' },
            { label: 'Amino acids', value: 'aa' },
          ]}
          selected={sequenceType}
          onSelect={setSequenceType}
        />
      </div>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={includeDeletions}
              onChange={handleDeletions}
              inputProps={{ 'aria-label': 'controlled' }}
            />
          }
          label='Include deletions'
        />
      </FormGroup>
      <div className='mb-2 flex'>
        <PipeDividedOptionsButtons
          options={[
            { label: 'Entropy over time', value: 'overTime' },
            { label: 'Entropy per position', value: 'perPosition' },
          ]}
          selected={plotType}
          onSelect={setPlotType}
        />
      </div>
      {plotType === 'perPosition' && (
        <div className=' w-72 flex mb-2'>
          <div className='mr-2'>Gene:</div>
          <Form.Control
            as='select'
            value={selectedGene}
            onChange={event => setSelectedGene(event.target.value)}
            className='flex-grow'
            size='sm'
          >
            <option value='all'>All</option>
            {jsonRefData.genes.slice(0, -1).map(gene => (
              <option value={gene.name} key={gene?.name}>
                {gene.name}
              </option>
            ))}
          </Form.Control>
        </div>
      )}
      {plotType === 'overTime' && (
        <div className='flex mb-2'>
          <div className='mr-2'>Genes:</div>
          <Select
            closeMenuOnSelect={false}
            placeholder='Select genes...'
            isMulti
            options={options}
            styles={colorStyles}
            onChange={onChange}
            value={selectedGeneOptions}
          />
        </div>
      )}
      {plotType === 'perPosition' && (
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={includePositionsWithZeroEntropy}
                onChange={event => setIncludePositionsWithZeroEntropy(event.target.checked)}
                inputProps={{ 'aria-label': 'controlled' }}
              />
            }
            label='Include positions with zero entropy'
          />
        </FormGroup>
      )}
      {plotType === 'perPosition' && (
        <div className='flex mb-2'>
          <div className='mr-2'>Entropy display threshold:</div>
          <PercentageInput ratio={threshold} setRatio={setThreshold} className='mr-2' />
        </div>
      )}
      {includePositionsWithZeroEntropy && plotType === 'perPosition' && (
        <div>
          <p>
            Setting the entropy display threshold to 0 may lead to slower performance and too many positions
            to resolve at once in the plot. Zooming in via the brush control or gene selector displays the
            bars again.
          </p>
        </div>
      )}
    </div>
  );

  let geneRange: Gene | undefined = jsonRefData.genes.find(gene => gene.name === selectedGene);
  return (
    <NamedCard title='Nucleotide Entropy'>
      {controls}
      <Plot
        selector={selector}
        sequenceType={sequenceType}
        selectedGenes={selectedGenes}
        includeDeletions={includeDeletions}
        includePositionsWithZeroEntropy={includePositionsWithZeroEntropy}
        threshold={threshold}
        plotType={plotType}
        geneRange={geneRange}
      />
    </NamedCard>
  );
};

type PlotProps = {
  selector: LapisSelector;
  sequenceType: 'aa' | 'nuc';
  selectedGenes: GeneOption[];
  includeDeletions: boolean;
  includePositionsWithZeroEntropy: boolean;
  threshold: number;
  plotType: 'overTime' | 'perPosition';
  geneRange: Gene | undefined;
};

export const Plot = ({
  selector,
  sequenceType,
  selectedGenes,
  includeDeletions,
  includePositionsWithZeroEntropy,
  threshold,
  plotType,
  geneRange,
}: PlotProps) => {
  const data = useData(
    selector,
    sequenceType,
    selectedGenes,
    includeDeletions,
    includePositionsWithZeroEntropy
  );

  if (data === undefined) {
    return <Loader />;
  }

  if (plotType === 'perPosition') {
    return <PerPositionPlot threshold={threshold} plotData={data} geneRange={geneRange} />;
  }
  return <OverTimePlot plotData={data} selectedGenes={selectedGenes} />;
};

const useData = (
  selector: LapisSelector,
  sequenceType: SequenceType,
  selectedGenes: GeneOption[],
  deletions: boolean,
  includePositionsWithZeroEntropy: boolean
): Data | undefined => {
  //fetch the proportions per position over the whole date range
  const mutationProportionEntriesQuery = useQuery(
    async signal => {
      return {
        sequenceType: sequenceType,
        result: await Promise.all([MutationProportionData.fromApi(selector, sequenceType, signal)]).then(
          async ([data]) => {
            const proportions: MutationProportionEntry[] = data.payload.map(m => m);
            return {
              proportions,
            };
          }
        ),
      };
    },
    [selector, sequenceType]
  );

  //fetch the proportions per position in weekly segments
  const weeklyMutationProportionQuery = useQuery(
    async signal => {
      //calculate weeks
      const dayArray: UnifiedDay[] = [
        selector.dateRange?.getDateRange().dateFrom!,
        selector.dateRange?.getDateRange().dateTo!,
      ];
      const dayRange = globalDateCache.rangeFromDays(dayArray)!;
      const weeks = globalDateCache.weeksFromRange({ min: dayRange.min.isoWeek, max: dayRange.max.isoWeek });
      const weekDateRanges = new Array<DateRange>();
      for (let i = 0; i < weeks.length; i++) {
        let dateRange: DateRange = { dateFrom: weeks[i].firstDay, dateTo: weeks[i].firstDay };
        weekDateRanges[i] = dateRange;
      }

      const weekSelectors: LapisSelector[] = weekDateRanges.map(w => ({
        ...selector,
        dateRange: new FixedDateRangeSelector(w),
      }));

      return Promise.all(
        weekSelectors.map((w, i) =>
          MutationProportionData.fromApi(w, sequenceType, signal).then(data => {
            const proportions: MutationProportionEntry[] = data.payload.map(m => m);
            let date = weekDateRanges[i];
            return {
              proportions,
              date,
            };
          })
        )
      );
    },
    [selector, sequenceType]
  );

  return useMemo(() => {
    if (!mutationProportionEntriesQuery.data || !weeklyMutationProportionQuery.data) {
      return undefined;
    }
    const sequenceType = mutationProportionEntriesQuery.data?.sequenceType;
    if (!sequenceType) {
      return undefined;
    }
    if (!selectedGenes) {
      return undefined;
    }
    //calculate ticks for entropy-over-time plot
    const dates = weeklyMutationProportionQuery.data.map(p => {
      return { date: p.date.dateFrom?.dayjs.toDate()! };
    });
    const ticks = getTicks(dates);

    //transform data for entropy-per-position plot
    const positionEntropy = calculateEntropy(
      mutationProportionEntriesQuery.data.result.proportions,
      sequenceType,
      deletions,
      includePositionsWithZeroEntropy
    );
    const sortedEntropy =
      sequenceType === 'aa' ? sortListByAAMutation(positionEntropy, m => m.position) : positionEntropy;

    //transform data for entropy-over-time plot
    const weeklyMeanEntropies: TransformedTime[] = [];
    selectedGenes.forEach(selectedGene => {
      const timeData = weeklyMeanEntropy(
        weeklyMutationProportionQuery.data,
        sequenceType,
        selectedGene,
        deletions
      )
        .slice(0, -1)
        .map(({ week, meanEntropy }) => {
          return { day: week.dateFrom?.dayjs.toDate().getTime(), [selectedGene.value]: meanEntropy };
        });
      weeklyMeanEntropies.push(timeData);
    });
    const timeArr: any = [];
    const timeMap = new Map();
    weeklyMeanEntropies.forEach(weeklyEntropy => {
      weeklyEntropy.forEach(obj => {
        if (timeMap.has(obj.day)) {
          timeMap.set(obj.day, { ...timeMap.get(obj.day), ...obj });
        } else {
          timeMap.set(obj.day, { ...obj });
        }
      });
    });
    timeMap.forEach(obj => timeArr.push(obj));

    return { positionEntropy: sortedEntropy, timeData: timeArr, sequenceType: sequenceType, ticks: ticks };
  }, [
    mutationProportionEntriesQuery,
    weeklyMutationProportionQuery,
    selectedGenes,
    deletions,
    includePositionsWithZeroEntropy,
  ]);
};

type BarPlotProps = {
  threshold: number;
  plotData: Data;
  geneRange: Gene | undefined;
};

export const PerPositionPlot: React.FC<BarPlotProps> = ({ threshold, plotData, geneRange }) => {
  const filteredEntropy = plotData.positionEntropy.filter(p => p.entropy >= threshold);
  const startIndex = getBrushIndex(geneRange, filteredEntropy, plotData.sequenceType).startIndex;
  const stopIndex = getBrushIndex(geneRange, filteredEntropy, plotData.sequenceType).stopIndex;

  return (
    <ResponsiveContainer width='100%' height='100%'>
      <BarChart
        key={(startIndex || 0) + (stopIndex || 0)} //This fixes a weird bug where the plot doesn't redraw when the brush indexes are changed
        width={500}
        height={500}
        data={filteredEntropy}
        barCategoryGap={0}
        barGap={0}
        margin={{
          top: 30,
          right: 20,
          left: 20,
          bottom: 5,
        }}
      >
        <XAxis dataKey='position' tickFormatter={formatXAxis} />
        <YAxis ticks={[0, 0.5, 1]} />
        <Tooltip content={<CustomTooltip />} allowEscapeViewBox={{ y: true }} wrapperStyle={toolTipStyle} />
        <Legend />
        <Bar shape={CustomBar} dataKey='entropy' legendType='none'></Bar>
        <Brush
          dataKey='name'
          height={10}
          stroke={colors.active}
          travellerWidth={10}
          gap={10}
          startIndex={startIndex}
          endIndex={stopIndex}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

type LinePlotProps = {
  plotData: Data;
  selectedGenes: GeneOption[];
};

export const OverTimePlot: React.FC<LinePlotProps> = ({ plotData, selectedGenes }) => {
  return (
    <ResponsiveContainer width='100%' height='100%'>
      <LineChart
        width={500}
        height={500}
        data={plotData.timeData}
        margin={{
          top: 30,
          right: 20,
          left: 20,
          bottom: 5,
        }}
      >
        <XAxis
          dataKey='day'
          scale='time'
          type='number'
          tickFormatter={formatDate}
          domain={[(dataMin: any) => dataMin, () => plotData.timeData[plotData.timeData.length - 1]?.day]}
          ticks={plotData.ticks}
          xAxisId='day'
        />
        <YAxis />
        <Tooltip
          formatter={(value: string) => Number(value).toFixed(6)}
          labelFormatter={label => {
            return 'Week starting on: ' + formatDate(label);
          }}
        />
        <Legend />
        {selectedGenes.map((gene: GeneOption) => (
          <Line
            xAxisId='day'
            type='monotone'
            dataKey={gene.value}
            strokeWidth={3}
            dot={false}
            stroke={gene.color}
            isAnimationActive={false}
            key={gene.value}
            legendType='none'
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};
