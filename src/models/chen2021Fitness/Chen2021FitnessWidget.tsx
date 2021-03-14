import { Widget } from '../../widgets/Widget';
import { ZodQueryEncoder } from '../../helpers/query-encoder';
import { SampleSelectorSchema } from '../../helpers/sample-selector';
import * as zod from 'zod';
import React, { useEffect, useState } from 'react';
import { get } from '../../services/api';
import {
  Chen2021FitnessRequestSchema,
  Chen2021FitnessResponseSchema,
  ValueWithCISchema,
} from './chen2021Fitness-types';
import styled from 'styled-components';
import { Col, Form, Button } from 'react-bootstrap';
import { Plot } from '../../components/Plot';

const ContainerPropsSchema = SampleSelectorSchema;
type ContainerProps = zod.infer<typeof SampleSelectorSchema>;

const ResultsPropsSchema = zod.object({
  request: Chen2021FitnessRequestSchema,
});
type ResultsProps = zod.infer<typeof ResultsPropsSchema>;

type Chen2021FitnessRequest = zod.infer<typeof Chen2021FitnessRequestSchema>;
type Chen2021FitnessResponse = zod.infer<typeof Chen2021FitnessResponseSchema>;

const getData = async (
  params: Chen2021FitnessRequest,
  signal: AbortSignal
): Promise<Chen2021FitnessResponse | null> => {
  const mutationsString = params.mutations.join(',');
  const url =
    `/computed/model/chen2021Fitness` +
    `?country=${params.country}` +
    `&mutations=${mutationsString}` +
    `&matchPercentage=${params.matchPercentage}` +
    (params.samplingStrategy ? `&dataType=${params.samplingStrategy}` : '') +
    `&alpha=${params.alpha}` +
    `&generationTime=${params.generationTime}` +
    `&reproductionNumberWildtype=${params.reproductionNumberWildtype}` +
    `&plotStartDate=${params.plotStartDate.toISOString().substring(0, 10)}` +
    `&plotEndDate=${params.plotEndDate.toISOString().substring(0, 10)}` +
    `&initialWildtypeCases=${params.initialWildtypeCases}` +
    `&initialVariantCases=${params.initialVariantCases}`;
  const response = await get(url, signal);
  if (response.status !== 200) {
    // The computation might fail, for example, if some values go out-of-bound. The issue shall be addressed with the
    // introduction of a better error handling and reporting on the server side.
    return null;
  }
  const data = await response.json();
  if (!data) {
    return null;
  }
  return Chen2021FitnessResponseSchema.parse(data);
};

const Wrapper = styled.div`
  background-color: #ffe0b6;
  padding: 15px;
`;

const SectionHeader = styled.h5`
  margin-top: 20px;
`;

const Chen2021FitnessContainer = ({
  country,
  mutations,
  matchPercentage,
  samplingStrategy,
}: ContainerProps) => {
  const [paramData, setParamData] = useState<Chen2021FitnessRequest>({
    country,
    mutations,
    matchPercentage,
    samplingStrategy,
    alpha: 0.95,
    generationTime: 4.8,
    reproductionNumberWildtype: 1,
    plotStartDate: new Date('2021-01-01'),
    plotEndDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    initialWildtypeCases: 1000,
    initialVariantCases: 100,
  });
  const [formGenerationTime, setFormGenerationTime] = useState(paramData.generationTime.toString());
  const [formReproductionNumberWildtype, setFormReproductionNumberWildtype] = useState(
    paramData.reproductionNumberWildtype.toString()
  );
  const [formInitialVariantCases, setFormInitialVariantCases] = useState(
    paramData.initialVariantCases.toString()
  );
  const [formInitialWildtypeCases, setFormInitialWildtypeCases] = useState(
    paramData.initialWildtypeCases.toString()
  );

  useEffect(() => {
    setParamData(p => ({
      ...p,
      country,
      mutations,
      matchPercentage,
      samplingStrategy,
    }));
  }, [country, mutations, matchPercentage, samplingStrategy]);

  const compute = () => {
    setParamData({
      ...paramData,
      generationTime: parseFloat(formGenerationTime),
      reproductionNumberWildtype: parseFloat(formReproductionNumberWildtype),
      initialVariantCases: parseInt(formInitialVariantCases),
      initialWildtypeCases: parseInt(formInitialWildtypeCases),
    });
  };

  return (
    <Wrapper>
      <h4>Fitness Advantage Estimation</h4>
      <p>
        The model assumes that the increase or decrease of the proportion of a variant follows a logistic
        function. It fits a logistic model to the data by optimizing the maximum likelihood to obtain the
        logistic growth rate a. From that, an estimate of the transmission fitness advantage under a
        continuous (f_c) and discrete (f_d) model is derived.
      </p>
      <SectionHeader>Parameters</SectionHeader>
      <Form>
        <Form.Row>
          <Form.Group as={Col} controlId='formGenerationTime'>
            <Form.Label>Generation time</Form.Label>
            <Form.Control value={formGenerationTime} onChange={x => setFormGenerationTime(x.target.value)} />
          </Form.Group>
          <Form.Group as={Col} controlId='formReproductionNumberWildtype'>
            <Form.Label>Reproduction number of the wildtype</Form.Label>
            <Form.Control
              value={formReproductionNumberWildtype}
              onChange={x => setFormReproductionNumberWildtype(x.target.value)}
            />
          </Form.Group>
        </Form.Row>
        <Form.Row>
          <Form.Group as={Col} controlId='formInitialWildtypeCases'>
            <Form.Label>Initial wildtype cases</Form.Label>
            <Form.Control
              value={formInitialWildtypeCases}
              onChange={x => setFormInitialWildtypeCases(x.target.value)}
            />
          </Form.Group>
          <Form.Group as={Col} controlId='formInitialVariantCases'>
            <Form.Label>Initial variant cases</Form.Label>
            <Form.Control
              value={formInitialVariantCases}
              onChange={x => setFormInitialVariantCases(x.target.value)}
            />
          </Form.Group>
        </Form.Row>
      </Form>
      <Button onClick={compute}>Compute</Button>
      <SectionHeader>Results</SectionHeader>
      <Chen2021FitnessResults request={paramData} />
      <SectionHeader>References</SectionHeader>
      <ul>
        <li>
          Chen, Chaoran, et al. "Quantification of the spread of SARS-CoV-2 variant B. 1.1. 7 in Switzerland."
          medRxiv (2021); doi:{' '}
          <a href='https://doi.org/10.1101/2021.03.05.21252520' target='_blank' rel='noreferrer'>
            10.1101/2021.03.05.21252520
          </a>
        </li>
        <li>
          <a
            href='https://github.com/cevo-public/Quantification-of-the-spread-of-a-SARS-CoV-2-variant'
            target='_blank'
            rel='noreferrer'
          >
            https://github.com/cevo-public/Quantification-of-the-spread-of-a-SARS-CoV-2-variant
          </a>
        </li>
      </ul>
    </Wrapper>
  );
};

const formatValueWithCI = (
  { value, ciLower, ciUpper }: zod.infer<typeof ValueWithCISchema>,
  fractionDigits = 4,
  usePercentSign = false
) => {
  if (usePercentSign) {
    return (
      `${(value * 100).toFixed(fractionDigits)}% ` +
      `[${(ciLower * 100).toFixed(fractionDigits)}%, ${(ciUpper * 100).toFixed(fractionDigits)}%]`
    );
  } else {
    return `${value.toFixed(fractionDigits)} [${ciLower.toFixed(fractionDigits)}, ${ciUpper.toFixed(
      fractionDigits
    )}]`;
  }
};

const Chen2021FitnessResults = ({ request }: ResultsProps) => {
  const [modelData, setModelData] = useState<Chen2021FitnessResponse | undefined | null>(undefined);

  useEffect(() => {
    let isSubscribed = true;
    const controller = new AbortController();
    const signal = controller.signal;
    getData(request, signal)
      .then(newModelData => {
        if (isSubscribed) {
          setModelData(newModelData);
        }
      })
      .catch(e => {
        console.log('Called fetch data error', e);
      });
    return () => {
      isSubscribed = false;
      controller.abort();
    };
  }, [request]);

  if (!modelData) {
    return <>A fitness advantage cannot be estimated for this variant.</>;
  }

  const filteredDaily: zod.infer<typeof Chen2021FitnessResponseSchema.shape.daily> = {
    t: [],
    proportion: [],
    ciLower: [],
    ciUpper: [],
  };
  const filteredDailyText = [];
  const daily = modelData.daily;
  for (let i = 0; i < daily.t.length; i++) {
    const d = new Date(daily.t[i]);
    if (d >= request.plotStartDate && d <= request.plotEndDate) {
      filteredDaily.t.push(daily.t[i]);
      filteredDaily.proportion.push(daily.proportion[i]);
      filteredDaily.ciLower.push(daily.ciLower[i]);
      filteredDaily.ciUpper.push(daily.ciUpper[i]);
      filteredDailyText.push(
        formatValueWithCI(
          {
            value: daily.proportion[i],
            ciLower: daily.ciLower[i],
            ciUpper: daily.ciUpper[i],
          },
          2,
          true
        )
      );
    }
  }

  const plotProportionText = [];
  const plotProportion = modelData.plotProportion;
  for (let i = 0; i < plotProportion.t.length; i++) {
    plotProportionText.push(
      formatValueWithCI(
        {
          value: plotProportion.proportion[i],
          ciLower: plotProportion.ciLower[i],
          ciUpper: plotProportion.ciUpper[i],
        },
        2,
        true
      )
    );
  }

  return (
    <>
      <div>Logistic growth rate a: {modelData && formatValueWithCI(modelData.params.a)}</div>
      {/*TODO t_0 is currently difficult (or impossible?) to interpret.*/}
      {/*<div>Sigmoid's midpoint t_0: {modelData && formatValueWithCI(modelData.params.t0, 0)}</div>*/}
      <div>Fitness advantage f_c: {modelData && formatValueWithCI(modelData.params.fc)}</div>
      <div>Fitness advantage f_d: {modelData && formatValueWithCI(modelData.params.fd)}</div>
      <div style={{ height: '300px', marginTop: '20px' }}>
        <Plot
          style={{ width: '100%', height: '100%' }}
          data={[
            {
              name: '95% confidence interval',
              showlegend: false,
              line: { color: 'transparent' },
              type: 'scatter',
              mode: 'lines',
              x: modelData.plotProportion.t.map(dateString => new Date(dateString)),
              y: modelData.plotProportion.ciUpper,
              hoverinfo: 'x',
            },
            {
              name: '95% confidence interval',
              fill: 'tonexty',
              fillcolor: 'lightgray',
              line: { color: 'transparent' },
              type: 'scatter',
              mode: 'lines',
              x: modelData.plotProportion.t.map(dateString => new Date(dateString)),
              y: modelData.plotProportion.ciLower,
              hoverinfo: 'x',
            },
            {
              name: 'Logistic fit',
              type: 'scatter',
              mode: 'lines',
              x: modelData.plotProportion.t.map(dateString => new Date(dateString)),
              y: modelData.plotProportion.proportion,
              text: plotProportionText,
              hovertemplate: '%{text}',
            },
            {
              name: 'Estimated daily proportion',
              type: 'scatter',
              mode: 'markers',
              marker: {
                size: 4,
              },
              text: filteredDailyText,
              hovertemplate: '%{text}',
              x: filteredDaily.t.map(dateString => new Date(dateString)),
              y: filteredDaily.proportion,
            },
          ]}
          layout={{
            title: 'Estimated proportion through time',
            xaxis: {
              hoverformat: '%d.%m.%Y',
            },
          }}
          config={{
            displaylogo: false,
            modeBarButtons: [['zoom2d', 'toImage', 'resetScale2d', 'pan2d']],
            responsive: true,
          }}
        />
      </div>
      <div style={{ height: '300px', marginTop: '20px' }}>
        <Plot
          style={{ width: '100%', height: '100%' }}
          data={[
            {
              name: 'Wildtype',
              type: 'scatter',
              mode: 'lines',
              x: modelData.plotProportion.t.map(dateString => new Date(dateString)),
              y: modelData.plotAbsoluteNumbers.wildtypeCases,
              stackgroup: 'one',
            },
            {
              name: 'Variant',
              type: 'scatter',
              mode: 'lines',
              x: modelData.plotProportion.t.map(dateString => new Date(dateString)),
              y: modelData.plotAbsoluteNumbers.variantCases,
              stackgroup: 'one',
            },
          ]}
          layout={{
            title: 'Changes in absolute case numbers through time',
            xaxis: {
              hoverformat: '%d.%m.%Y',
            },
          }}
          config={{
            displaylogo: false,
            modeBarButtons: [['zoom2d', 'toImage', 'resetScale2d', 'pan2d']],
            responsive: true,
          }}
        />
      </div>
    </>
  );
};

export const Chen2021FitnessWidget = new Widget(
  new ZodQueryEncoder(ContainerPropsSchema),
  Chen2021FitnessContainer,
  'Chen2021FitnessModel'
);
