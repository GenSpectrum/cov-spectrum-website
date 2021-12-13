import { Althaus2021GrowthParameters, Althaus2021GrowthParametersAttribute } from './althaus2021Growth-types';
import { useCallback, useState } from 'react';
import { useDeepCompareEffect } from '../../helpers/deep-compare-hooks';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { Form } from 'react-bootstrap';

type Props = {
  defaultParams: Althaus2021GrowthParameters;
  setParams: (params: Althaus2021GrowthParameters) => void;
};

export const Althaus2021GrowthParameterPanel = ({ defaultParams, setParams }: Props) => {
  const [currentParams, setCurrentParams] = useState(defaultParams);
  useDeepCompareEffect(() => setCurrentParams(defaultParams), [defaultParams]);

  const [estimateAttribute, setEstimateAttribute] = useState<Althaus2021GrowthParametersAttribute>(
    'transmissibilityIncrease'
  );

  const change = useCallback(
    (attr: Althaus2021GrowthParametersAttribute, value: number) => {
      const newParams = {
        ...currentParams,
        [attr]: value,
      };
      setCurrentParams(newParams);
      setParams(newParams);
    },
    // Don't trigger this function when currentParams changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setCurrentParams, setParams]
  );

  const paramEntries: {
    label: string;
    attribute: Althaus2021GrowthParametersAttribute;
    value: number;
    min: number;
    max: number;
    step: number;
  }[] = [
    {
      label: 'Increase in transmissibility',
      attribute: 'transmissibilityIncrease',
      value: currentParams.transmissibilityIncrease,
      min: -5,
      max: 5,
      step: 0.05,
    },
    {
      label: 'Increase in infectious duration',
      attribute: 'durationIncrease',
      value: currentParams.durationIncrease,
      min: -5,
      max: 5,
      step: 0.05,
    },
    {
      label: 'Immune evasion',
      attribute: 'immuneEvasion',
      value: currentParams.immuneEvasion,
      min: 0,
      max: 1,
      step: 0.05,
    },
    {
      label: 'Proportion of susceptibles',
      attribute: 'susceptiblesProportion',
      value: currentParams.susceptiblesProportion,
      min: 0,
      max: 1,
      step: 0.05,
    },
    {
      label: 'Reproduction number (wildtype)',
      attribute: 'reproductionNumberWildtype',
      value: currentParams.reproductionNumberWildtype,
      min: 0.05,
      max: 5,
      step: 0.05,
    },
    {
      label: 'Generation time (wildtype)',
      attribute: 'generationTime',
      value: currentParams.generationTime,
      min: 3,
      max: 10,
      step: 0.1,
    },
  ];

  return (
    <>
      <div className='flex flex-row flex-wrap'>
        {paramEntries.map(p => (
          <div className='px-4 py-1'>
            <div className='mb-2'>{p.label}</div>
            <div className='flex flex-row align-items-center'>
              {/* TODO Oh.. Only after I implemented this, I realized that I don't need a new library
                  but can just use <input type="range"> or Form.Range in react-bootstrap. Well, it looks nice and I am
                  currently too lazy to change it again.
              */}
              <Slider
                value={p.value}
                min={p.min}
                max={p.max}
                step={p.step}
                onChange={value => change(p.attribute, value)}
                disabled={estimateAttribute === p.attribute}
                style={{ minWidth: '100px' }}
              />
              <Form.Control
                type='number'
                value={p.value}
                onChange={e => change(p.attribute, Number.parseInt(e.target.value))}
                disabled={estimateAttribute === p.attribute}
                className='w-20 ml-4'
              />
              <Form.Check
                type='checkbox'
                label='Estimate'
                checked={estimateAttribute === p.attribute}
                onChange={() => setEstimateAttribute(p.attribute)} // It is not allowed to uncheck something.
                className='ml-2'
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
