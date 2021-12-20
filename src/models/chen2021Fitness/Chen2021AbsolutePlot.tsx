import React, { useMemo } from 'react';
import { TitleWrapper } from '../../widgets/common';
import { Plot } from '../../components/Plot';
import { Chen2021FitnessRequest, Chen2021FitnessResponse, ValueWithCI } from './chen2021Fitness-types';

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

export const Chen2021AbsolutePlot = ({ modelData, request }: Props) => {
  const variantCaseNumbers = useMemo(() => {
    const reproductionNumberVariant: ValueWithCI = {
      value: (1 + modelData.params.fc.value) * request.reproductionNumberWildtype,
      ciLower: (1 + modelData.params.fc.ciLower) * request.reproductionNumberWildtype,
      ciUpper: (1 + modelData.params.fc.ciUpper) * request.reproductionNumberWildtype,
    };
    const variantCases = modelData.plotAbsoluteNumbers.t.map(dateString => {
      const t = daysBetween(new Date(dateString), request.plotStartDate);
      console.log(t, dateString, daysBetween(new Date(dateString), request.plotStartDate));
      return Math.min(
        Math.round(
          request.initialVariantCases * reproductionNumberVariant.value ** (t / request.generationTime)
        ),
        maxInt
      );
    });
    const variantCasesLower = modelData.plotAbsoluteNumbers.t.map(dateString => {
      const t = daysBetween(new Date(dateString), request.plotStartDate);
      return Math.min(
        Math.round(
          request.initialVariantCases * reproductionNumberVariant.ciLower ** (t / request.generationTime)
        ),
        maxInt
      );
    });
    const variantCasesUpper = modelData.plotAbsoluteNumbers.t.map(dateString => {
      const t = daysBetween(new Date(dateString), request.plotStartDate);
      return Math.min(
        Math.round(
          request.initialVariantCases * reproductionNumberVariant.ciUpper ** (t / request.generationTime)
        ),
        maxInt
      );
    });
    return { variantCases, variantCasesLower, variantCasesUpper };
  }, [modelData, request]);

  console.log(modelData, request, variantCaseNumbers);

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
            y: modelData.plotAbsoluteNumbers.wildtypeCases,
            stackgroup: 'one',
            line: {
              color: '#1f77b4',
            },
            text: modelData.plotAbsoluteNumbers.wildtypeCases.map(n => n.toString()),
            hovertemplate: '%{text}',
          },
          {
            name: 'Variant',
            type: 'scatter',
            mode: 'lines',
            x: modelData.plotAbsoluteNumbers.t.map(dateString => new Date(dateString)),
            y: modelData.plotAbsoluteNumbers.variantCases,
            stackgroup: 'one',
            line: {
              color: '#ff7f0f',
            },
            text: modelData.plotAbsoluteNumbers.variantCases.map(n => n.toString()),
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
            y: arrAdd(variantCaseNumbers.variantCasesUpper, modelData.plotAbsoluteNumbers.wildtypeCases),
            text: variantCaseNumbers.variantCasesUpper.map(n => n.toString()),
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
            y: arrAdd(variantCaseNumbers.variantCasesLower, modelData.plotAbsoluteNumbers.wildtypeCases),
            text: variantCaseNumbers.variantCasesLower.map(n => n.toString()),
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
