import React, { useState } from 'react';
import { Chen2021FitnessRequest } from './chen2021Fitness-types';
import { Button, Col, Form } from 'react-bootstrap';
import styled from 'styled-components';
import { Chen2021FitnessResults } from './Chen2021FitnessResults';
import { fillRequestWithDefaults } from './loading';
import { dateToString } from './format-value';
import { ExternalLink } from '../../components/ExternalLink';
import { LocationSelector } from '../../data/LocationSelector';
import { VariantSelector } from '../../data/VariantSelector';
import { SamplingStrategy } from '../../data/SamplingStrategy';
import { useDeepCompareEffect } from '../../helpers/deep-compare-hooks';

export type ContainerProps = {
  locationSelector: LocationSelector;
  variantSelector: VariantSelector;
  samplingStrategy: SamplingStrategy;
};

type ChangePointFormEntry = {
  reproductionNumberString: string;
  dateString: string;
};

const SectionHeader = styled.h5`
  margin-top: 20px;
`;

export const Chen2021FitnessContainer = ({
  locationSelector,
  variantSelector,
  samplingStrategy,
}: ContainerProps) => {
  const [paramData, setParamData] = useState<Chen2021FitnessRequest>(() =>
    fillRequestWithDefaults({ locationSelector, variantSelector, samplingStrategy })
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
  const [changePoints, setChangePoints] = useState<ChangePointFormEntry[]>([]);

  useDeepCompareEffect(() => {
    setParamData(p => ({
      ...p,
      location: locationSelector,
      variant: variantSelector,
    }));
  }, [locationSelector, variantSelector]);

  const compute = () => {
    setParamData({
      ...paramData,
      generationTime: parseFloat(formGenerationTime),
      reproductionNumberWildtype: parseFloat(formReproductionNumberWildtype),
      initialVariantCases: parseInt(formInitialVariantCases),
      initialWildtypeCases: parseInt(formInitialWildtypeCases),
      plotStartDate: new Date(formPlotStartDate),
      plotEndDate: new Date(formPlotEndDate),
      changePoints: changePoints.map(x => ({
        reproductionNumberWildtype: parseFloat(x.reproductionNumberString),
        date: new Date(x.dateString),
      })),
    });
  };

  const addChangePoint = () => {
    setChangePoints(prev => [
      ...prev,
      {
        reproductionNumberString: '1',
        dateString: formPlotStartDate,
      },
    ]);
  };

  const setChangePointDate = (index: number, dateString: string) => {
    setChangePoints(prev => {
      const newList = [];
      for (let i = 0; i < prev.length; i++) {
        if (i !== index) {
          newList.push(prev[i]);
        } else {
          newList.push({
            ...prev[i],
            dateString,
          });
        }
      }
      return newList;
    });
  };

  const setChangePointR = (index: number, reproductionNumberString: string) => {
    setChangePoints(prev => {
      const newList = [];
      for (let i = 0; i < prev.length; i++) {
        if (i !== index) {
          newList.push(prev[i]);
        } else {
          newList.push({
            ...prev[i],
            reproductionNumberString,
          });
        }
      }
      return newList;
    });
  };

  const removeChangePoint = (index: number) => {
    setChangePoints(prev => {
      const newList = [];
      for (let i = 0; i < prev.length; i++) {
        if (i !== index) {
          newList.push(prev[i]);
        }
      }
      return newList;
    });
  };

  return (
    <>
      <div className='mx-6 pt-3'>
        <p>
          The model assumes that the increase or decrease of the proportion of a variant follows a logistic
          function. It fits a logistic model to the data by optimizing the maximum likelihood to obtain the
          logistic growth rate a. From that, an estimate of the relative growth advantage under a continuous
          (f_c) and discrete (f_d) model is derived.
        </p>
        <SectionHeader>Parameters</SectionHeader>
        <Form>
          <Form.Row>
            <Form.Group as={Col} controlId='formGenerationTime'>
              <Form.Label>Generation time</Form.Label>
              <Form.Control
                value={formGenerationTime}
                onChange={x => setFormGenerationTime(x.target.value)}
              />
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
          <div className='font-bold'>Changes in reproduction number of the wildtype</div>
          {changePoints.map(({ reproductionNumberString, dateString }, i) => (
            <Form.Row>
              <Form.Group as={Col} controlId={`changePointDate-${i}`}>
                <Form.Label>Date</Form.Label>
                <Form.Control value={dateString} onChange={x => setChangePointDate(i, x.target.value)} />
              </Form.Group>
              <Form.Group as={Col} controlId={`changePointR-${i}`}>
                <Form.Label>Reproduction number</Form.Label>
                <Form.Control
                  value={reproductionNumberString}
                  onChange={x => setChangePointR(i, x.target.value)}
                />
              </Form.Group>
              <button
                className='underline outline-none'
                onClick={e => {
                  e.preventDefault();
                  removeChangePoint(i);
                }}
              >
                Remove
              </button>
            </Form.Row>
          ))}
        </Form>
        <div>
          <button className='underline outline-none' onClick={addChangePoint}>
            Add change point
          </button>
        </div>
        <Button onClick={compute} className='mt-4'>
          Compute
        </Button>
      </div>
      <h1 className='ml-6 mt-8'>Results</h1>
      <Chen2021FitnessResults request={paramData} />
      <div className='ml-6'>
        <h1>References</h1>
        <ul className='list-disc'>
          <li>
            Chen, Chaoran, et al. "Quantification of the spread of SARS-CoV-2 variant B.1.1.7 in Switzerland."
            Epidemics (2021); doi:{' '}
            <ExternalLink url='https://doi.org/10.1016/j.epidem.2021.100480'>
              10.1016/j.epidem.2021.100480
            </ExternalLink>
          </li>
          <li>
            <ExternalLink url='https://github.com/cevo-public/Quantification-of-the-spread-of-a-SARS-CoV-2-variant' />
          </li>
        </ul>
      </div>
    </>
  );
};
