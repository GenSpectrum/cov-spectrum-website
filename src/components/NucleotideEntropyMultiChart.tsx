import React, { useState, useMemo } from 'react';
import { MutationProportionData } from '../data/MutationProportionDataset';
import Loader from './Loader';
import { useQuery } from '../helpers/query-hook';
import { MutationProportionEntry } from '../data/MutationProportionEntry';
import { LapisSelector } from '../data/LapisSelector';
import { PipeDividedOptionsButtons } from '../helpers/ui';
//import { NamedCard } from './NamedCard';
import { XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, } from 'recharts';
import { SequenceType } from '../data/SequenceType';
// import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { Form } from 'react-bootstrap';
import { globalDateCache, UnifiedDay } from '../helpers/date-cache';
import { FixedDateRangeSelector } from '../data/DateRangeSelector';
import { DateRange } from '../data/DateRange';
// import { decodeNucMutation } from '../helpers/nuc-mutation';
// import { decodeAAMutation, sortListByAAMutation } from '../helpers/aa-mutation';
import jsonRefData from '../data/refData.json';
//import { colors } from '../widgets/common';
// import { mapLabelsToColors } from '../helpers/colors';
//import chroma from 'chroma-js';
// import Select, { CSSObjectWithLabel, StylesConfig } from 'react-select';
import { TransformedTime, GeneOption, WeeklyMeanEntropy } from './NucleotideEntropy';
import { useExploreUrl } from '../helpers/explore-url';
import { pprettyColors } from '../helpers/colors';

type Props = {
    selectors: LapisSelector[];
  };

type Variant = {
  variant: string;
}

const genes = jsonRefData.genes;
!genes.map(o => o.name).includes('All') &&
  genes.push({ name: 'All', startPosition: 0, endPosition: 29903, aaSeq: ''});

function nonNullValues(obj: any) {
  return Object.entries(obj).filter(([key, value]) => value !== undefined).map(([key, value]) => value).toString();
}

export const NucleotideEntropyMultiChart = ({ selectors }: Props) => {
    const [sequenceType, setSequenceType] = useState<SequenceType>('nuc');
    const [gene, setGene] = useState<string>('All');

    const exploreUrl = useExploreUrl()!;
    const variants = exploreUrl.variants?.map(nonNullValues);

    let selectedGene: GeneOption[] = genes.filter(g => g.name === gene).map(g => {
        return {
            value: g.name,
            label: g.name,
            startPosition: g.startPosition,
            endPosition: g.endPosition,
            aaSeq: g.aaSeq,
            color: ''
          };
    })

    const data = useData(selectors, selectedGene, variants, sequenceType);

    const controls = (
        <div className='mb-4'>
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
          {
            <div className=' w-72 flex mb-2'>
              <div className='mr-2'>Gene:</div>
              <Form.Control
                as='select'
                value={gene}
                onChange={ev => setGene(ev.target.value)}
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
          }
        </div>
    );

    let plotArea;
    if (variants![0].length == 0) {
      plotArea = <p>Select one or more lineages to compare.</p>
    } else if (!data) {
      plotArea = <Loader />;
    } else {
        plotArea = (
        <Plot
            plotData={data}
            variants={variants!}
        />
        );
    }
    
    return (
        <>
        {controls}
        {plotArea}
        </>
      );
}

type PlotProps = {
    plotData: TransformedTime;
    variants: string[];
};

const useData = (
    selectors: LapisSelector[],
    selectedGene: GeneOption[],
    variants: any,
    sequenceType: SequenceType
): TransformedTime | undefined => {
  //fetch the proportions per position in weekly segments
  const weeklyVariantMutationProportionQuery = useQuery(
    async signal => {
      //calculate weeks
      const dayArray: UnifiedDay[] = [selectors[0].dateRange?.getDateRange().dateFrom!, selectors[0].dateRange?.getDateRange().dateTo!];
      const dayRange = globalDateCache.rangeFromDays(dayArray)!;
      const weeks = globalDateCache.weeksFromRange({ min: dayRange.min.isoWeek, max: dayRange.max.isoWeek });
      const weekDateRanges = new Array<DateRange>();
      for (let i = 0; i < weeks.length; i++) {
        let dateRange: DateRange = { dateFrom: weeks[i].firstDay, dateTo: weeks[i].firstDay };
        weekDateRanges[i] = dateRange;
      }

      const weekSelectors = new Array<LapisSelector>(); 
      selectors.forEach(selector => {
          for (let w of weekDateRanges) { 
            weekSelectors.push({
            ...selector,
            dateRange: new FixedDateRangeSelector(w),
          })
        };
      })

      let weekLength = weekDateRanges.length;

      return {
        sequenceType: sequenceType,
        weekNumber: weekLength,
        result: await Promise.all(
          weekSelectors.map((w, i) =>
            MutationProportionData.fromApi(w, sequenceType, signal).then(data => {
              const proportions: MutationProportionEntry[] = data.payload.map(m => m);
              let date = weekDateRanges[i % weekLength];
              return {
                proportions,
                date,
              };
            })
          )
        )
      }
    },
    [selectors, sequenceType]
  );
    
  const data = useMemo(() => {
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
    if (!variants[0]){
      return undefined;
    }
    if (variants.length*weekNumber != weeklyVariantMutationProportionQuery.data.result.length){
      return undefined;
    }

    const timeData: TransformedTime = WeeklyMeanEntropy(weeklyVariantMutationProportionQuery.data.result, sequenceType, selectedGene[0]).map(({ week, meanEntropy }, i) => {
      return { day: week.dateFrom?.string, [variants[Math.floor(i/weekNumber)]]: meanEntropy };
    });
    const dayMap = new Map();
    timeData.forEach(tt => {
      const day = tt.day;
      if (dayMap.has(day)) {
        const dayGroup = dayMap.get(day);
        dayMap.set(day, {...dayGroup, ...tt});
      } else {
        dayMap.set(day, tt);
      }
    });
    const dayArray = Array.from(dayMap.values());
    
    return dayArray

  },[weeklyVariantMutationProportionQuery, selectedGene, variants]);
    
  return data;
} 

const Plot = ({ plotData, variants }: PlotProps) => {
return (
    <>
    <div>
    <ResponsiveContainer width='100%' height='100%'>
        <LineChart
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
        <XAxis dataKey='day' />
        <YAxis  />
        <Tooltip
            formatter={(value: string) => Number(value).toFixed(6)}
            labelFormatter={label => {
            return 'Week starting on: ' + label;
            }}
        />
        <Legend />
        {variants.map((variant, i) => (
            <Line
            type='monotone'
            dataKey={variant}
            strokeWidth={3}
            dot={false}
            stroke={pprettyColors[i]}
            isAnimationActive={false}
            key={variant}
            legendType='none'
            />
        ))}
        </LineChart>
    </ResponsiveContainer>
    </div>
    </>
)
}