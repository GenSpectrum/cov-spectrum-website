import React, { useEffect, useState } from 'react';
import { Chen2021FitnessRequest } from './chen2021Fitness-types';
import { Button, Col, Form } from 'react-bootstrap';
import * as zod from 'zod';
import { OldSampleSelectorSchema } from '../../helpers/sample-selector';
import styled from 'styled-components';
import { Chen2021FitnessResults } from './Chen2021FitnessResults';
import { fillRequestWithDefaults } from './loading';
import { dateToString } from './format-value';
import { ExternalLink } from '../../components/ExternalLink';

export type ContainerProps = zod.infer<typeof OldSampleSelectorSchema>;

const SectionHeader = styled.h5`
  margin-top: 20px;
`;

export const Chen2021FitnessContainer = ({
  country,
  mutations,
  matchPercentage,
  pangolinLineage,
  samplingStrategy,
}: ContainerProps) => {
  const [paramData, setParamData] = useState<Chen2021FitnessRequest>(() =>
    fillRequestWithDefaults({ country, mutations, matchPercentage, pangolinLineage, samplingStrategy })
  );
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
  const [formPlotStartDate, setFormPlotStartDate] = useState(dateToString(paramData.plotStartDate));
  const [formPlotEndDate, setFormPlotEndDate] = useState(dateToString(paramData.plotEndDate));

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
      plotStartDate: new Date(formPlotStartDate),
      plotEndDate: new Date(formPlotEndDate),
    });
  };

  return (
    <>
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
        <Form.Row>
          <Form.Group as={Col} controlId='formPlotStartDate'>
            <Form.Label>Start date</Form.Label>
            <Form.Control value={formPlotStartDate} onChange={x => setFormPlotStartDate(x.target.value)} />
          </Form.Group>
          <Form.Group as={Col} controlId='formPlotEndDate'>
            <Form.Label>End date</Form.Label>
            <Form.Control value={formPlotEndDate} onChange={x => setFormPlotEndDate(x.target.value)} />
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
          <ExternalLink url='https://doi.org/10.1101/2021.03.05.21252520'>
            10.1101/2021.03.05.21252520
          </ExternalLink>
        </li>
        <li>
          <ExternalLink url='https://github.com/cevo-public/Quantification-of-the-spread-of-a-SARS-CoV-2-variant' />
        </li>
      </ul>
    </>
  );
};
