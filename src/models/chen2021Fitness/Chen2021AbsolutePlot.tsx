import React, { useMemo, useState } from 'react';
import { TitleWrapper } from '../../widgets/common';
import { Plot } from '../../components/Plot';
import {
  ChangePoint,
  ChangePointWithFc,
  Chen2021FitnessRequest,
  Chen2021FitnessResponse,
} from './chen2021Fitness-types';
import { parse } from 'json2csv';
import { globalDateCache, UnifiedDay } from '../../helpers/date-cache';
import Form from 'react-bootstrap/Form';
import { EstimatedCasesPlotEntry } from '../../widgets/EstimatedCasesChartInner';
import { Data } from 'plotly.js';
import dayjs from 'dayjs';

interface Props {
  modelData: Chen2021FitnessResponse;
  request: Chen2021FitnessRequest;
  t0: UnifiedDay;
  changePoints?: ChangePointWithFc[];
  estimatedCasesPlotData: EstimatedCasesPlotEntry[];
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
    for (let { date, reproductionNumberWildtype } of filteredChangePoints) {
      if (d < date) {
        continue;
      }
      const appliedDays = Math.min(daysBetween(daysOffset, date), daysBetween(daysOffset, startDate));
      appliedChangePoints.push({
        r: reproductionNumberWildtype,
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

function transformChangePoints(
  changePointWildtype: ChangePointWithFc[],
  field: 'value' | 'ciLower' | 'ciUpper'
): ChangePoint[] {
  return changePointWildtype.map(c => ({
    date: c.date,
    reproductionNumberWildtype: (1 + c.fc[field]) * c.reproductionNumberWildtype,
  }));
}

export const Chen2021AbsolutePlot = ({
  modelData,
  request,
  t0,
  changePoints,
  estimatedCasesPlotData,
}: Props) => {
  const [showNumberTotalCases, setShowNumberTotalCases] = useState(false);
  const [showNumberVariantWildtypeCases, setShowNumberVariantWildtypeCases] = useState(false);

  const caseNumbers = useMemo(() => {
    // Prepare and transform the change points of the reproduction number
    const changePointsWildtype = [
      {
        date: t0.dayjs.add(request.config.tStart, 'day').toDate(),
        reproductionNumberWildtype: request.config.reproductionNumberWildtype,
        fc: modelData.params.fc,
      },
    ];
    if (changePoints) {
      changePointsWildtype.push(...changePoints);
    }
    const changePointsVariant = {
      value: transformChangePoints(changePointsWildtype, 'value'),
      ciLower: transformChangePoints(changePointsWildtype, 'ciLower'),
      ciUpper: transformChangePoints(changePointsWildtype, 'ciUpper'),
    };

    // Calculate the model case numbers
    const dates = modelData.estimatedAbsoluteNumbers.t.map(date => date.dayjs.toDate());
    const wildtypeCases = calculateCases(
      t0.dayjs.add(request.config.tStart, 'day').toDate(),
      dates,
      changePointsWildtype,
      request.config.initialCasesWildtype,
      request.config.generationTime
    );
    const variantCases = calculateCases(
      t0.dayjs.add(request.config.tStart, 'day').toDate(),
      dates,
      changePointsVariant.value,
      request.config.initialCasesVariant,
      request.config.generationTime
    );
    const variantCasesLower = calculateCases(
      t0.dayjs.add(request.config.tStart, 'day').toDate(),
      dates,
      changePointsVariant.ciLower,
      request.config.initialCasesVariant,
      request.config.generationTime
    );
    const variantCasesUpper = calculateCases(
      t0.dayjs.add(request.config.tStart, 'day').toDate(),
      dates,
      changePointsVariant.ciUpper,
      request.config.initialCasesVariant,
      request.config.generationTime
    );

    // Get the confirmed case numbers and those based on existing sequence data
    const confirmedCasesMap = new Map<
      UnifiedDay,
      {
        variant: number;
        wildtype: number;
      }
    >();
    for (let { estimatedCases: variant, estimatedWildtypeCases: wildtype, date } of estimatedCasesPlotData) {
      confirmedCasesMap.set(globalDateCache.getDayUsingDayjs(dayjs(date)), { variant, wildtype });
    }
    const confirmedTotalCases = [];
    const estimatedConfirmedVariantCases = [];
    const estimatedConfirmedWildtypeCases = [];
    for (let date of modelData.estimatedAbsoluteNumbers.t) {
      let { variant, wildtype } = confirmedCasesMap.get(date) ?? { variant: NaN, wildtype: NaN };
      if (variant + wildtype === 0) {
        variant = NaN;
        wildtype = NaN;
      }
      confirmedTotalCases.push(variant + wildtype);
      estimatedConfirmedVariantCases.push(variant);
      estimatedConfirmedWildtypeCases.push(wildtype);
    }

    return {
      variantCases,
      variantCasesLower,
      variantCasesUpper,
      wildtypeCases,
      dates,
      confirmedTotalCases,
      estimatedConfirmedVariantCases,
      estimatedConfirmedWildtypeCases,
    };
  }, [modelData, request, t0, changePoints, estimatedCasesPlotData]);

  if (!caseNumbers) {
    return <></>;
  }

  const downloadData = () => {
    const data = [];
    for (let i = 0; i < modelData.estimatedAbsoluteNumbers.t.length; i++) {
      data.push({
        date: modelData.estimatedAbsoluteNumbers.t[i].string,
        wildtype: caseNumbers.wildtypeCases[i],
        variant: caseNumbers.variantCases[i],
        variantUpper: caseNumbers.variantCasesUpper[i],
        variantLower: caseNumbers.variantCasesLower[i],
      });
    }
    const csv = parse(data);
    // Download as file
    const element = document.createElement('a');
    const file = new Blob([csv], { type: 'text/csv' });
    element.href = URL.createObjectURL(file);
    element.download = 'estimated_absolute_cases.csv';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const plotLayers: Data[] = [
    {
      name: 'Wildtype (model)',
      type: 'scatter',
      mode: 'lines',
      x: caseNumbers.dates,
      y: caseNumbers.wildtypeCases,
      stackgroup: 'one',
      line: {
        color: '#1f77b4',
      },
      text: caseNumbers.wildtypeCases.map(n => n.toString()),
      hovertemplate: '%{text}',
    },
    {
      name: 'Variant (model)',
      type: 'scatter',
      mode: 'lines',
      x: caseNumbers.dates,
      y: caseNumbers.variantCases,
      stackgroup: 'one',
      line: {
        color: '#ff7f0f',
      },
      text: caseNumbers.variantCases.map(n => n.toString()),
      hovertemplate: '%{text}',
    },
    {
      name: 'Variant (model, upper bound)',
      type: 'scatter',
      mode: 'lines',
      line: {
        dash: 'dot',
        width: 4,
        color: '#ff7f0f',
      },
      x: caseNumbers.dates,
      y: arrAdd(caseNumbers.variantCasesUpper, caseNumbers.wildtypeCases),
      text: caseNumbers.variantCasesUpper.map(n => n.toString()),
      hovertemplate: '%{text}',
    },
    {
      name: 'Variant (model, lower bound)',
      type: 'scatter',
      mode: 'lines',
      line: {
        dash: 'dot',
        width: 4,
        color: '#ff7f0f',
      },
      x: caseNumbers.dates,
      y: arrAdd(caseNumbers.variantCasesLower, caseNumbers.wildtypeCases),
      text: caseNumbers.variantCasesLower.map(n => n.toString()),
      hovertemplate: '%{text}',
    },
  ];

  if (showNumberTotalCases) {
    plotLayers.push({
      name: 'Total confirmed cases (data)',
      type: 'scatter',
      mode: 'lines',
      x: caseNumbers.dates,
      y: caseNumbers.confirmedTotalCases,
      line: {
        color: '#000000',
      },
      text: caseNumbers.confirmedTotalCases.map(n => n.toString()),
      hovertemplate: '%{text}',
    });
  }
  if (showNumberVariantWildtypeCases) {
    plotLayers.push(
      {
        name: 'Estimated wildtype cases (data)',
        type: 'scatter',
        mode: 'lines',
        x: caseNumbers.dates,
        y: caseNumbers.estimatedConfirmedWildtypeCases,
        line: {
          color: '#1b3ab5',
        },
        text: caseNumbers.estimatedConfirmedWildtypeCases.map(n => n.toString()),
        hovertemplate: '%{text}',
      },
      {
        name: 'Estimated variant cases (data)',
        type: 'scatter',
        mode: 'lines',
        x: caseNumbers.dates,
        y: arrAdd(caseNumbers.estimatedConfirmedVariantCases, caseNumbers.estimatedConfirmedWildtypeCases),
        line: {
          color: '#ff960d',
        },
        text: caseNumbers.estimatedConfirmedVariantCases.map(n => n.toString()),
        hovertemplate: '%{text}',
      }
    );
  }

  return (
    <>
      <button onClick={downloadData} className='hover:underline outline-none'>
        Download data
      </button>
      <TitleWrapper id='graph_title'>Changes in absolute case numbers through time**</TitleWrapper>
      <Plot
        style={{ width: '100%', height: '60%' }}
        data={plotLayers}
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
        (**) If the estimated advantage is an intrinsic viral advantage due to increased transmission or
        immune escape and if nothing on measures, behavior, population immunity, seasonality etc. changes,
        then the number of cases would develop as shown. However, the above-mentioned variables change and
        thus the plot must be taken as a null model scenario rather than a projection of what will happen.
      </p>
      <div>
        <h3>Settings</h3>
        <Form.Check
          type='checkbox'
          label='Show total number of confirmed cases from data'
          checked={showNumberTotalCases}
          onChange={() => setShowNumberTotalCases(!showNumberTotalCases)}
        />
        <Form.Check
          type='checkbox'
          label='Show number of estimated variant and wildtype cases from data (stacked on top of each other)'
          checked={showNumberVariantWildtypeCases}
          onChange={() => setShowNumberVariantWildtypeCases(!showNumberVariantWildtypeCases)}
        />
      </div>
    </>
  );
};
