import React, { ChangeEvent, Dispatch, SetStateAction, useMemo, useState } from 'react';
import { MutationProportionData } from '../../data/MutationProportionDataset';
import Loader from '../Loader';
import { useQuery } from '../../helpers/query-hook';
import { LapisSelector } from '../../data/LapisSelector';
import { PipeDividedOptionsButtons } from '../../helpers/ui';
import { Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import { SequenceType } from '../../data/SequenceType';
import { Form } from 'react-bootstrap';
import { globalDateCache } from '../../helpers/date-cache';
import { FixedDateRangeSelector } from '../../data/DateRangeSelector';
import { DateRange } from '../../data/DateRange';
import jsonRefData from '../../data/refData.json';
import { TransformedTime } from './NucleotideEntropy';
import { GeneOption, weeklyMeanEntropy } from './calculateEntropy';
import { useExploreUrl } from '../../helpers/explore-url';
import { pprettyColors } from '../../helpers/colors';
import { getTicks } from '../../helpers/ticks';
import { formatDate } from '../../widgets/VariantTimeDistributionLineChartInner';
import { genes } from './genes';

type Props = {
  selectors: LapisSelector[];
};

function nonNullValues(obj: any) {
  return Object.entries(obj)
    .filter(([_, value]) => value !== undefined)
    .map(([_, value]) => value)
    .toString();
}

export const NucleotideEntropyMultiChart = ({ selectors }: Props) => {
  const [sequenceType, setSequenceType] = useState<SequenceType>('nuc');
  const [selectedGene, setSelectedGene] = useState<string>('All');
  const [includeDeletions, setIncludeDeletions] = useState<boolean>(false);

  const handleDeletions = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIncludeDeletions(event.target.checked);
  };

  const exploreUrl = useExploreUrl()!;
  const variants = (exploreUrl.variants ?? []).map(nonNullValues);

  let selectedGeneOptions = genes
    .filter(gene => gene.name === selectedGene)
    .map(gene => {
      return {
        value: gene.name,
        label: gene.name,
        startPosition: gene.startPosition,
        endPosition: gene.endPosition,
        aaSeq: gene.aaSeq,
        color: '',
      };
    });

  return (
    <>
      <Controls
        sequenceType={sequenceType}
        onSequenceTypeSelect={setSequenceType}
        includeDeletions={includeDeletions}
        onIncludeDeletionsChange={handleDeletions}
        selectedGene={selectedGene}
        onSelectedGeneChange={event => setSelectedGene(event.target.value)}
      />
      <Plot
        selectors={selectors}
        selectedGeneOptions={selectedGeneOptions}
        variants={variants}
        sequenceType={sequenceType}
        includeDeletions={includeDeletions}
      />
    </>
  );
};

function Controls(props: {
  sequenceType: SequenceType;
  onSequenceTypeSelect: Dispatch<SetStateAction<SequenceType>>;
  includeDeletions: boolean;
  onIncludeDeletionsChange: (event: ChangeEvent<HTMLInputElement>) => void;
  selectedGene: string;
  onSelectedGeneChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className='mb-4'>
      <div className='mb-2 flex'>
        <PipeDividedOptionsButtons
          options={[
            { label: 'Nucleotide', value: 'nuc' },
            { label: 'Amino Acids', value: 'aa' },
          ]}
          selected={props.sequenceType}
          onSelect={props.onSequenceTypeSelect}
        />
      </div>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={props.includeDeletions}
              onChange={props.onIncludeDeletionsChange}
              inputProps={{ 'aria-label': 'controlled' }}
            />
          }
          label='Include deletions'
        />
      </FormGroup>
      <div className=' w-72 flex mb-2'>
        <div className='mr-2'>Gene:</div>
        <Form.Control
          as='select'
          value={props.selectedGene}
          onChange={props.onSelectedGeneChange}
          className='flex-grow'
          size='sm'
        >
          {jsonRefData.genes.map(gene => (
            <option value={gene.name} key={gene.name}>
              {gene.name}
            </option>
          ))}
        </Form.Control>
      </div>
    </div>
  );
}

const useData = (
  selectors: LapisSelector[],
  selectedGene: GeneOption[],
  variants: any,
  sequenceType: SequenceType,
  deletions: boolean
): any | undefined => {
  const days = [
    selectors[0].dateRange?.getDateRange().dateFrom!,
    selectors[0].dateRange?.getDateRange().dateTo!,
  ];
  const dayRange = globalDateCache.rangeFromDays(days)!;
  const weekDateRanges: DateRange[] = globalDateCache
    .weeksFromRange({
      min: dayRange.min.isoWeek,
      max: dayRange.max.isoWeek,
    })
    .map(week => ({
      dateFrom: week.firstDay,
      dateTo: week.firstDay,
    }));

  const weekSelectors = selectors.flatMap(selector =>
    weekDateRanges.map(weekRange => ({
      ...selector,
      dateRange: new FixedDateRangeSelector(weekRange),
    }))
  );

  let weekRangesCount = weekDateRanges.length;

  const weeklyVariantMutationProportionQuery = useQuery(
    async signal =>
      await Promise.all(
        weekSelectors.map((weekSelector, i) =>
          MutationProportionData.fromApi(weekSelector, sequenceType, signal).then(data => ({
            proportions: data.payload,
            date: weekDateRanges[i % weekRangesCount],
          }))
        )
      ),
    [selectors, sequenceType]
  );

  return useMemo(() => {
    if (!weeklyVariantMutationProportionQuery.data) {
      return undefined;
    }
    if (!selectedGene) {
      return undefined;
    }
    if (!variants[0]) {
      return undefined;
    }
    if (variants.length * weekRangesCount !== weeklyVariantMutationProportionQuery.data.length) {
      return undefined;
    }

    const dates = weeklyVariantMutationProportionQuery.data.map(proportionData => {
      return { date: proportionData.date.dateFrom?.dayjs.toDate()! };
    });
    const ticks = getTicks(dates);

    const timeData: TransformedTime = weeklyMeanEntropy(
      weeklyVariantMutationProportionQuery.data,
      sequenceType,
      selectedGene[0],
      deletions
    ).map(({ week, meanEntropy }, i) => {
      return {
        day: week.dateFrom?.dayjs.toDate().getTime(),
        [variants[Math.floor(i / weekRangesCount)]]: meanEntropy,
      };
    });
    const dayMap = new Map();
    timeData.forEach(tt => {
      const day = tt.day;
      if (dayMap.has(day)) {
        const dayGroup = dayMap.get(day);
        dayMap.set(day, { ...dayGroup, ...tt });
      } else {
        dayMap.set(day, tt);
      }
    });
    const dayArray = Array.from(dayMap.values()).slice(0, -1); //depending on the day, the latest week just started, so the entropy is calculated as 0 because there are no samples

    return { dayArray, ticks };
  }, [
    weeklyVariantMutationProportionQuery,
    selectedGene,
    variants,
    deletions,
    sequenceType,
    weekRangesCount,
  ]);
};

type PlotProps = {
  selectors: LapisSelector[];
  selectedGeneOptions: GeneOption[];
  variants: string[];
  sequenceType: SequenceType;
  includeDeletions: boolean;
};

const Plot = ({ selectors, selectedGeneOptions, variants, sequenceType, includeDeletions }: PlotProps) => {
  const data = useData(selectors, selectedGeneOptions, variants, sequenceType, includeDeletions);

  if (variants![0].length === 0) {
    return <p>Select one or more lineages to compare.</p>;
  }

  if (!data) {
    return <Loader />;
  }

  return (
    <>
      <ResponsiveContainer width='100%' height={200}>
        <LineChart
          key={sequenceType}
          width={500}
          height={500}
          data={data.dayArray}
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
            domain={[(dataMin: any) => dataMin, () => data.dayArray[data.dayArray.length - 1].day]}
            ticks={data.ticks}
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
          {variants.sort().map((variant, i) => (
            <Line
              xAxisId='day'
              type='monotone'
              dataKey={variant}
              strokeWidth={3}
              dot={false}
              stroke={pprettyColors[i]}
              isAnimationActive={false}
              legendType='none'
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </>
  );
};
