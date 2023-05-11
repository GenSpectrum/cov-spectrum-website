import React, { useState, useMemo } from 'react';
import { MutationProportionData } from '../../data/MutationProportionDataset';
import Loader from '../Loader';
import { useQuery } from '../../helpers/query-hook';
import { MutationProportionEntry } from '../../data/MutationProportionEntry';
import { LapisSelector } from '../../data/LapisSelector';
import { PipeDividedOptionsButtons } from '../../helpers/ui';
import { XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
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

type Props = {
  selectors: LapisSelector[];
};

const genes = jsonRefData.genes;
!genes.map(o => o.name).includes('All') &&
  genes.push({ name: 'All', startPosition: 0, endPosition: 29903, aaSeq: '' });

function nonNullValues(obj: any) {
  return Object.entries(obj)
    .filter(([key, value]) => value !== undefined)
    .map(([key, value]) => value)
    .toString();
}

export const NucleotideEntropyMultiChart = ({ selectors }: Props) => {
  const [sequenceType, setSequenceType] = useState<SequenceType>('nuc');
  const [gene, setGene] = useState<string>('All');
  const [deletions, setDeletions] = useState<boolean>(false);

  const handleDeletions = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDeletions(event.target.checked);
  };

  const exploreUrl = useExploreUrl()!;
  const variants = exploreUrl.variants?.map(nonNullValues);

  let selectedGene: GeneOption[] = genes
    .filter(g => g.name === gene)
    .map(g => {
      return {
        value: g.name,
        label: g.name,
        startPosition: g.startPosition,
        endPosition: g.endPosition,
        aaSeq: g.aaSeq,
        color: '',
      };
    });

  const data = useData(selectors, selectedGene, variants, sequenceType, deletions);

  const controls = (
    <div className='mb-4'>
      <div className='mb-2 flex'>
        <PipeDividedOptionsButtons
          options={[
            { label: 'Nucleotide', value: 'nuc' },
            { label: 'Amino Acids', value: 'aa' },
          ]}
          selected={sequenceType}
          onSelect={setSequenceType}
        />
      </div>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={deletions}
              onChange={handleDeletions}
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
          value={gene}
          onChange={event => setGene(event.target.value)}
          className='flex-grow'
          size='sm'
        >
          {jsonRefData.genes.map(g => (
            <option value={g.name} key={g?.name}>
              {g.name}
            </option>
          ))}
        </Form.Control>
      </div>
    </div>
  );

  let plotArea;
  if (variants![0].length === 0) {
    plotArea = <p>Select one or more lineages to compare.</p>;
  } else if (!data) {
    plotArea = <Loader />;
  } else {
    plotArea = (
      <Plot plotData={data.dayArray} ticks={data.ticks} variants={variants!} sequenceType={sequenceType} />
    );
  }

  return (
    <>
      {controls}
      {plotArea}
    </>
  );
};

type PlotProps = {
  plotData: TransformedTime;
  ticks: string[];
  variants: string[];
  sequenceType: SequenceType;
};

const useData = (
  selectors: LapisSelector[],
  selectedGene: GeneOption[],
  variants: any,
  sequenceType: SequenceType,
  deletions: boolean
): any | undefined => {
  const weeklyVariantMutationProportionQuery = useQuery(
    async signal => {
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
        weekDateRanges.map(w => ({
          ...selector,
          dateRange: new FixedDateRangeSelector(w),
        }))
      );

      let weekLength = weekDateRanges.length;

      return {
        sequenceType: sequenceType,
        weekNumber: weekLength,
        result: await Promise.all(
          weekSelectors.map((weekSelector, i) =>
            MutationProportionData.fromApi(weekSelector, sequenceType, signal).then(data => {
              const proportions: MutationProportionEntry[] = data.payload.map(m => m);
              let date = weekDateRanges[i % weekLength];
              return {
                proportions,
                date,
              };
            })
          )
        ),
      };
    },
    [selectors, sequenceType]
  );

  return useMemo(() => {
    if (!weeklyVariantMutationProportionQuery.data) {
      return undefined;
    }
    let sequenceType = weeklyVariantMutationProportionQuery.data.sequenceType;
    if (!sequenceType) {
      return undefined;
    }
    const weekNumber = weeklyVariantMutationProportionQuery.data.weekNumber;
    if (!weekNumber) {
      return undefined;
    }
    if (!selectedGene) {
      return undefined;
    }
    if (!variants[0]) {
      return undefined;
    }
    if (variants.length * weekNumber !== weeklyVariantMutationProportionQuery.data.result.length) {
      return undefined;
    }

    const dates = weeklyVariantMutationProportionQuery.data.result.map(p => {
      return { date: p.date.dateFrom?.dayjs.toDate()! };
    });
    const ticks = getTicks(dates);

    const timeData: TransformedTime = weeklyMeanEntropy(
      weeklyVariantMutationProportionQuery.data.result,
      sequenceType,
      selectedGene[0],
      deletions
    ).map(({ week, meanEntropy }, i) => {
      return {
        day: week.dateFrom?.dayjs.toDate().getTime(),
        [variants[Math.floor(i / weekNumber)]]: meanEntropy,
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
  }, [weeklyVariantMutationProportionQuery, selectedGene, variants, deletions]);
};

const Plot = ({ plotData, ticks, variants, sequenceType }: PlotProps) => {
  return (
    <>
      <ResponsiveContainer width='100%' height={200}>
        <LineChart
          key={sequenceType}
          width={500}
          height={500}
          data={plotData}
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
            domain={[(dataMin: any) => dataMin, () => plotData[plotData.length - 1].day]}
            ticks={ticks}
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
