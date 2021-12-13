import { Althaus2021GrowthParameters, Althaus2021GrowthParametersAttribute } from './althaus2021Growth-types';
import { useCallback, useState } from 'react';
import { useDeepCompareEffect } from '../../helpers/deep-compare-hooks';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { Form } from 'react-bootstrap';
import { althaus2021GrowthMath, MathVariables } from './althaus2021Growth-math';

type Props = {
  growthRate: number;
  defaultParams: Althaus2021GrowthParameters;
};

function transformParameterNotation(
  growthRate: number,
  programParameters: Althaus2021GrowthParameters
): MathVariables {
  return {
    ρ: growthRate,
    τ: programParameters.transmissibilityIncrease,
    κ: programParameters.durationIncrease,
    ε: programParameters.immuneEvasion,
    S: programParameters.susceptiblesProportion,
    R: programParameters.reproductionNumberWildtype,
    D: programParameters.generationTime,
  };
}

const mathFunctions = new Map([
  ['transmissibilityIncrease', althaus2021GrowthMath.τ],
  ['durationIncrease', althaus2021GrowthMath.κ],
  ['immuneEvasion', althaus2021GrowthMath.ε],
  ['susceptiblesProportion', althaus2021GrowthMath.S],
  ['reproductionNumberWildtype', althaus2021GrowthMath.R],
  ['generationTime', althaus2021GrowthMath.D],
] as [Althaus2021GrowthParametersAttribute, (vars: MathVariables) => number][]);

export const Althaus2021GrowthParameterPanel = ({ growthRate, defaultParams }: Props) => {
  const [estimateAttribute, setEstimateAttribute] = useState<Althaus2021GrowthParametersAttribute>(
    'transmissibilityIncrease'
  );
  const [currentParams, setCurrentParams] = useState({
    ...defaultParams,
    [estimateAttribute]: mathFunctions.get(estimateAttribute)!(
      transformParameterNotation(growthRate, defaultParams)
    ),
  });
  useDeepCompareEffect(
    () =>
      setCurrentParams({
        ...defaultParams,
        [estimateAttribute]: mathFunctions.get(estimateAttribute)!(
          transformParameterNotation(growthRate, defaultParams)
        ),
      }),
    [defaultParams, growthRate]
  );

  const change = useCallback(
    (attr: Althaus2021GrowthParametersAttribute, value: number) =>
      setCurrentParams(currentParams => {
        const newParams = {
          ...currentParams,
          [attr]: value,
        };
        newParams[estimateAttribute] = mathFunctions.get(estimateAttribute)!(
          transformParameterNotation(growthRate, newParams)
        );
        return newParams;
      }),
    // Don't trigger this function when currentParams changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setCurrentParams, estimateAttribute, growthRate]
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
      label: 'Increase in transmissibility τ',
      attribute: 'transmissibilityIncrease',
      value: currentParams.transmissibilityIncrease,
      min: -5,
      max: 5,
      step: 0.05,
    },
    {
      label: 'Increase in infectious duration κ',
      attribute: 'durationIncrease',
      value: currentParams.durationIncrease,
      min: -5,
      max: 5,
      step: 0.05,
    },
    {
      label: 'Immune evasion ε',
      attribute: 'immuneEvasion',
      value: currentParams.immuneEvasion,
      min: 0,
      max: 1,
      step: 0.05,
    },
    {
      label: 'Proportion of susceptibles S',
      attribute: 'susceptiblesProportion',
      value: currentParams.susceptiblesProportion,
      min: 0,
      max: 1,
      step: 0.05,
    },
    {
      label: 'Reproduction number (wildtype) R_W',
      attribute: 'reproductionNumberWildtype',
      value: currentParams.reproductionNumberWildtype,
      min: 0.05,
      max: 5,
      step: 0.05,
    },
    {
      label: 'Generation time (wildtype) D',
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
                step={p.step}
                onChange={e => change(p.attribute, Number.parseFloat(e.target.value))}
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
