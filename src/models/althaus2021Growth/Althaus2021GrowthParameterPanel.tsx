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

type ParamEntry = {
  label: JSX.Element;
  attribute: Althaus2021GrowthParametersAttribute;
  value: number;
  softMin: number;
  softMax: number;
  hardMin: number;
  hardMax: number;
  step: number;
};

/**
 * A yellow border should be shown if the value is outside [softMin; softMax]. A red border should be shown if the
 * value is outside [hardMin; hardMax].
 */
function drawParamEntryWarnBorders(entry: ParamEntry): string {
  if (entry.value < entry.hardMin || entry.value > entry.hardMax) {
    return 'border-2 border-red-600';
  }
  if (entry.value < entry.softMin || entry.value > entry.softMax) {
    return 'border-2 border-yellow-300';
  }
  return '';
}

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

  const paramEntries: ParamEntry[] = [
    {
      label: (
        <>
          Increase in transmissibility <i>τ</i>
        </>
      ),
      attribute: 'transmissibilityIncrease',
      value: currentParams.transmissibilityIncrease,
      softMin: -5,
      softMax: 5,
      hardMin: -Infinity,
      hardMax: Infinity,
      step: 0.05,
    },
    {
      label: (
        <>
          Increase in infectious duration <i>κ</i>
        </>
      ),
      attribute: 'durationIncrease',
      value: currentParams.durationIncrease,
      softMin: -1,
      softMax: 3,
      hardMin: -0.9999,
      hardMax: Infinity,
      step: 0.05,
    },
    {
      label: (
        <>
          Immune evasion <i>ε</i>
        </>
      ),
      attribute: 'immuneEvasion',
      value: currentParams.immuneEvasion,
      softMin: 0,
      softMax: 1,
      hardMin: 0,
      hardMax: 1,
      step: 0.05,
    },
    {
      label: (
        <>
          Proportion of susceptibles <i>S</i>
        </>
      ),
      attribute: 'susceptiblesProportion',
      value: currentParams.susceptiblesProportion,
      softMin: 0,
      softMax: 1,
      hardMin: 0,
      hardMax: 1,
      step: 0.05,
    },
    {
      label: (
        <>
          Reproduction number (wildtype){' '}
          <i>
            R<sub>W</sub>
          </i>
        </>
      ),
      attribute: 'reproductionNumberWildtype',
      value: currentParams.reproductionNumberWildtype,
      softMin: 0.05,
      softMax: 5,
      hardMin: 0.0001,
      hardMax: Infinity,
      step: 0.05,
    },
    {
      label: (
        <>
          Generation time (wildtype) <i>D</i>
        </>
      ),
      attribute: 'generationTime',
      value: currentParams.generationTime,
      softMin: 3,
      softMax: 10,
      hardMin: 0,
      hardMax: Infinity,
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
                min={p.softMin}
                max={p.softMax}
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
                className={`w-20 ml-4 ${drawParamEntryWarnBorders(p)}`}
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
