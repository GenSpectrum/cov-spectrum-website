import React, { useEffect, useMemo, useState } from 'react';
import { ChangePoint, Chen2021FitnessRequest } from './chen2021Fitness-types';
import { Button, Col, Form } from 'react-bootstrap';
import styled from 'styled-components';
import { Chen2021FitnessResults } from './Chen2021FitnessResults';
import { fillRequestWithDefaults, transformToRequestData } from './loading';
import { ExternalLink } from '../../components/ExternalLink';
import { DateCountSampleData } from '../../data/sample/DateCountSampleDataset';
import { globalDateCache } from '../../helpers/date-cache';
import { LocationDateVariantSelector } from '../../data/LocationDateVariantSelector';
import dayjs from 'dayjs';
import { useQuery } from '../../helpers/query-hook';
import { FixedDateRangeSelector } from '../../data/DateRangeSelector';
import Loader from '../../components/Loader';

export type ContainerProps = {
  selector: LocationDateVariantSelector;
};

type ChangePointFormEntry = {
  reproductionNumberString: string;
  dateString: string;
};

const SectionHeader = styled.h5`
  margin-top: 20px;
`;

export const Chen2021FitnessContainer = ({ selector }: ContainerProps) => {
  // Form/param data
  const [formGenerationTime, setFormGenerationTime] = useState('4.8');
  const [formReproductionNumberWildtype, setFormReproductionNumberWildtype] = useState('1');
  const [formInitialVariantCases, setFormInitialVariantCases] = useState('10');
  const [formInitialWildtypeCases, setFormInitialWildtypeCases] = useState('1000');
  const [formPlotStartDate, setFormPlotStartDate] = useState(
    dayjs().subtract(90, 'day').format('YYYY-MM-DD')
  );
  const [formPlotEndDate, setFormPlotEndDate] = useState(dayjs().add(14, 'day').format('YYYY-MM-DD'));
  const [changePoints, setChangePoints] = useState<ChangePointFormEntry[]>([]);

  const changePointsTransformed: ChangePoint[] = useMemo(
    () =>
      changePoints.map(cp => ({
        reproductionNumberWildtype: Number.parseFloat(cp.reproductionNumberString),
        date: new Date(cp.dateString),
      })),
    [changePoints]
  );

  // Fetch data
  const [paramData, setParamData] = useState<Chen2021FitnessRequest | undefined>();
  const { data: variantDateCounts } = useQuery(
    signal =>
      DateCountSampleData.fromApi(
        {
          ...selector,
          dateRange: new FixedDateRangeSelector({
            dateFrom: globalDateCache.getDay(formPlotStartDate),
            dateTo: globalDateCache.getDay(formPlotEndDate),
          }),
        },
        signal
      ),
    [selector, paramData]
  );
  const { data: wholeDateCounts } = useQuery(
    signal =>
      DateCountSampleData.fromApi(
        {
          ...selector,
          dateRange: new FixedDateRangeSelector({
            dateFrom: globalDateCache.getDay(formPlotStartDate),
            dateTo: globalDateCache.getDay(formPlotEndDate),
          }),
          variant: {},
        },
        signal
      ),
    [selector, paramData]
  );
  const { request: requestData, t0 } =
    useMemo(() => {
      if (!variantDateCounts || !wholeDateCounts) {
        return undefined;
      }
      return transformToRequestData(variantDateCounts, wholeDateCounts);
    }, [variantDateCounts, wholeDateCounts]) ?? {};

  useEffect(() => requestData && setParamData(p => fillRequestWithDefaults(requestData, p?.config)), [
    requestData,
  ]);

  if (!requestData || !t0 || !variantDateCounts || !wholeDateCounts || !paramData) {
    return <Loader />;
  }

  const compute = () => {
    setParamData({
      data: paramData.data,
      config: {
        ...paramData.config,
        generationTime: parseFloat(formGenerationTime),
        reproductionNumberWildtype: parseFloat(formReproductionNumberWildtype),
        initialCasesVariant: parseInt(formInitialVariantCases),
        initialCasesWildtype: parseInt(formInitialWildtypeCases),
        tStart: globalDateCache.getDay(formPlotStartDate).dayjs.diff(t0.dayjs, 'day'),
        tEnd: globalDateCache.getDay(formPlotEndDate).dayjs.diff(t0.dayjs, 'day'),
      },
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
      <Chen2021FitnessResults
        request={paramData}
        t0={t0}
        variantDateCounts={variantDateCounts}
        wholeDateCounts={wholeDateCounts}
        changePoints={changePointsTransformed}
      />
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
