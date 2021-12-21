import React, { useMemo } from 'react';
import { TitleWrapper } from '../../widgets/common';
import { Plot } from '../../components/Plot';
import { ChangePoint, Chen2021FitnessRequest, Chen2021FitnessResponse } from './chen2021Fitness-types';

interface Props {
  modelData: Chen2021FitnessResponse;
  request: Chen2021FitnessRequest;
}

function daysBetween(date1: Date, date2: Date): number {
  return Math.round(
    Math.abs(
      (new Date(date1.toDateString()).getTime() - new Date(date2.toDateString()).getTime()) /
        (60 * 60 * 24 * 1000)
    )
  );
}

function arrAdd(arr1: number[], arr2: number[]): number[] {
  const result = [];
  for (let i = 0; i < arr1.length; i++) {
    result.push(arr1[i] + arr2[i]);
  }
  return result;
}

const maxInt = 2147483647;

function calculateCases(
  startDate: Date,
  dates: Date[],
  reproductionNumberChangePoints: ChangePoint[],
  initialCases: number,
  generationTime: number
) {
  const sortedChangePoints = [...reproductionNumberChangePoints].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );
  // Cut away irrelevant change points in the past
  const filteredChangePoints: ChangePoint[] = [];
  for (let i = 0; i < sortedChangePoints.length; i++) {
    const thisChangePoint = sortedChangePoints[i];
    // If there is a future change point that "shadows" this one, this one can be ignored.
    if (
      thisChangePoint.date < startDate &&
      sortedChangePoints[i + 1] !== undefined &&
      sortedChangePoints[i + 1].date <= startDate
    ) {
      continue;
    }
    filteredChangePoints.push(thisChangePoint);
  }
  // Reverse order: the following calculations go backwards in time
  filteredChangePoints.reverse();

  return dates.map(d => {
    // Calculate the distance to the different change points
    const appliedChangePoints: {
      r: number;
      days: number;
    }[] = [];
    let daysOffset = d;
    for (let { date, reproductionNumber } of filteredChangePoints) {
      if (d < date) {
        continue;
      }
      const appliedDays = Math.min(daysBetween(daysOffset, date), daysBetween(daysOffset, startDate));
      appliedChangePoints.push({
        r: reproductionNumber,
        days: appliedDays,
      });
      daysOffset = date;
    }
    // Calculate the case number
    let number = initialCases;
    for (let { r, days } of appliedChangePoints) {
      number *= r ** (days / generationTime);
    }
    return Math.min(maxInt, Math.round(number));
  });
}

function transformChangePoints(changePointWildtype: ChangePoint[], fc: number): ChangePoint[] {
  return changePointWildtype.map(c => ({
    date: c.date,
    reproductionNumber: (1 + fc) * c.reproductionNumber,
  }));
}

export const Chen2021AbsolutePlot = ({ modelData, request }: Props) => {
  const caseNumbers = useMemo(() => {
    // Prepare and transform the change points of the reproduction number
    const changePointsWildtype = [
      {
        reproductionNumber: request.reproductionNumberWildtype,
        date: request.plotStartDate,
      },
    ];
    if (request.changePoints) {
      changePointsWildtype.push(...request.changePoints);
    }
    const changePointsVariant = {
      value: transformChangePoints(changePointsWildtype, modelData.params.fc.value),
      ciLower: transformChangePoints(changePointsWildtype, modelData.params.fc.ciLower),
      ciUpper: transformChangePoints(changePointsWildtype, modelData.params.fc.ciUpper),
    };

    // Calculate case numbers
    const dates = modelData.plotAbsoluteNumbers.t.map(dateString => new Date(dateString));
    const wildtypeCases = calculateCases(
      request.plotStartDate,
      dates,
      changePointsWildtype,
      request.initialWildtypeCases,
      request.generationTime
    );
    const variantCases = calculateCases(
      request.plotStartDate,
      dates,
      changePointsVariant.value,
      request.initialVariantCases,
      request.generationTime
    );
    const variantCasesLower = calculateCases(
      request.plotStartDate,
      dates,
      changePointsVariant.ciLower,
      request.initialVariantCases,
      request.generationTime
    );
    const variantCasesUpper = calculateCases(
      request.plotStartDate,
      dates,
      changePointsVariant.ciUpper,
      request.initialVariantCases,
      request.generationTime
    );

    return { variantCases, variantCasesLower, variantCasesUpper, wildtypeCases };
  }, [modelData, request]);

  return (
    <>
      <TitleWrapper id='graph_title'>Changes in absolute case numbers through time**</TitleWrapper>
      <Plot
        style={{ width: '100%', height: '90%' }}
        data={[
          {
            name: 'Wildtype',
            type: 'scatter',
            mode: 'lines',
            x: modelData.plotAbsoluteNumbers.t.map(dateString => new Date(dateString)),
            y: caseNumbers.wildtypeCases,
            stackgroup: 'one',
            line: {
              color: '#1f77b4',
            },
            text: caseNumbers.wildtypeCases.map(n => n.toString()),
            hovertemplate: '%{text}',
          },
          {
            name: 'Variant',
            type: 'scatter',
            mode: 'lines',
            x: modelData.plotAbsoluteNumbers.t.map(dateString => new Date(dateString)),
            y: caseNumbers.variantCases,
            stackgroup: 'one',
            line: {
              color: '#ff7f0f',
            },
            text: caseNumbers.variantCases.map(n => n.toString()),
            hovertemplate: '%{text}',
          },
          {
            name: 'Variant (upper bound)',
            type: 'scatter',
            mode: 'lines',
            line: {
              dash: 'dot',
              width: 4,
              color: '#ff7f0f',
            },
            x: modelData.plotAbsoluteNumbers.t.map(dateString => new Date(dateString)),
            y: arrAdd(caseNumbers.variantCasesUpper, caseNumbers.wildtypeCases),
            text: caseNumbers.variantCasesUpper.map(n => n.toString()),
            hovertemplate: '%{text}',
          },
          {
            name: 'Variant (lower bound)',
            type: 'scatter',
            mode: 'lines',
            line: {
              dash: 'dot',
              width: 4,
              color: '#ff7f0f',
            },
            x: modelData.plotAbsoluteNumbers.t.map(dateString => new Date(dateString)),
            y: arrAdd(caseNumbers.variantCasesLower, caseNumbers.wildtypeCases),
            text: caseNumbers.variantCasesLower.map(n => n.toString()),
            hovertemplate: '%{text}',
          },
        ]}
        layout={{
          xaxis: {
            hoverformat: '%d.%m.%Y',
          },
          margin: {
            l: 50,
            r: 10,
            b: 40,
            t: 40,
            pad: 4,
          },
        }}
        config={{
          displaylogo: false,
          modeBarButtons: [['zoom2d', 'toImage', 'resetScale2d', 'pan2d']],
          responsive: true,
        }}
      />
      <p className='text-gray-500 text-xs'>
        (**) If the estimated advantage is a transmission advantage and if nothing on measures, behavior,
        population immunity, seasonality etc. changes, then the number of cases would develop as shown.
        However, the above-mentioned variables change and thus the plot must be taken as a null model scenario
        rather than a projection of what will happen.
      </p>
    </>
  );
};
