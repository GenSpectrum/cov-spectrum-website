import { Althaus2021GrowthParameters, Althaus2021GrowthParametersAttribute } from './althaus2021Growth-types';
import { useCallback, useState } from 'react';
import { useDeepCompareEffect } from '../../helpers/deep-compare-hooks';
import { Slider } from '@mui/material';
import { Form } from 'react-bootstrap';
import { althaus2021GrowthMath, MathVariables } from './althaus2021Growth-math';
import { ValueWithCI } from '../chen2021Fitness/chen2021Fitness-types';

type Props = {
  growthRate: ValueWithCI;
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
  estimable: boolean;
  formatter: (value: number) => string;
  parser: (text: string) => number;
};

const basicFormatter = (value: number) => value.toFixed(2);

const basicParser = (text: string) => Number.parseFloat(text);

const percentageFormatter = (value: number) => Math.round(value * 100) + '%';

const percentageParser = (text: string) => {
  if (!text.endsWith('%')) {
    text += '%';
  }
  return Number.parseFloat(text.substring(0, text.length - 1)) / 100;
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

function transformParameterNotation(programParameters: Althaus2021GrowthParameters): MathVariables {
  return {
    ρ: programParameters.growthRate,
    τ: programParameters.transmissibilityIncrease,
    κ: programParameters.durationIncrease,
    ε: programParameters.immuneEvasion,
    S: programParameters.susceptiblesProportion,
    R: programParameters.reproductionNumberWildtype,
    D: programParameters.generationTime,
  };
}

function calc(attribute: Althaus2021GrowthParametersAttribute, parameters: Althaus2021GrowthParameters) {
  return mathFunctions.get(attribute)!(transformParameterNotation(parameters));
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
  const [estimateAttribute, setEstimateAttribute] =
    useState<Althaus2021GrowthParametersAttribute>('transmissibilityIncrease');
  const [currentParams, setCurrentParams] = useState({
    ...defaultParams,
    [estimateAttribute]: calc(estimateAttribute, defaultParams),
  });
  useDeepCompareEffect(
    () =>
      setCurrentParams({
        ...defaultParams,
        [estimateAttribute]: calc(estimateAttribute, defaultParams),
      }),
    [defaultParams]
  );

  const change = useCallback(
    (attr: Althaus2021GrowthParametersAttribute, value: number) =>
      setCurrentParams(currentParams => {
        const newParams = {
          ...currentParams,
          [attr]: value,
        };
        newParams[estimateAttribute] = calc(estimateAttribute, newParams);
        return newParams;
      }),
    // Don't trigger this function when currentParams changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setCurrentParams, estimateAttribute]
  );

  const paramEntries: ParamEntry[] = [
    {
      label: (
        <>
          <b>
            Assumed logistic growth rate <i>ρ</i> (per day)
          </b>
        </>
      ),
      attribute: 'growthRate',
      value: currentParams.growthRate,
      softMin: growthRate.ciLower,
      softMax: growthRate.ciUpper,
      hardMin: growthRate.ciLower - 0.0001,
      hardMax: growthRate.ciUpper + 0.0001,
      step: 0.0001,
      estimable: false,
      formatter: basicFormatter,
      parser: basicParser,
    },
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
      estimable: true,
      formatter: percentageFormatter,
      parser: percentageParser,
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
      estimable: true,
      formatter: percentageFormatter,
      parser: percentageParser,
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
      estimable: true,
      formatter: percentageFormatter,
      parser: percentageParser,
    },
    {
      label: (
        <>
          Proportion of susceptibles (wildtype) <i>S</i>
        </>
      ),
      attribute: 'susceptiblesProportion',
      value: currentParams.susceptiblesProportion,
      softMin: 0,
      softMax: 1,
      hardMin: 0,
      hardMax: 1,
      step: 0.05,
      estimable: true,
      formatter: percentageFormatter,
      parser: percentageParser,
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
      estimable: true,
      formatter: basicFormatter,
      parser: basicParser,
    },
    {
      label: (
        <>
          Generation time (wildtype) <i>D</i> (in days)
        </>
      ),
      attribute: 'generationTime',
      value: currentParams.generationTime,
      softMin: 3,
      softMax: 10,
      hardMin: 0,
      hardMax: Infinity,
      step: 0.1,
      estimable: true,
      formatter: basicFormatter,
      parser: basicParser,
    },
  ];

  return (
    <>
      <div className='flex flex-row flex-wrap'>
        {paramEntries.map(p => (
          <div className='px-4 py-1' key={p.attribute}>
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
                onChange={(_, value) => change(p.attribute, value as number)}
                disabled={estimateAttribute === p.attribute}
                style={{ minWidth: '100px' }}
                size='small'
              />
              <Form.Control
                type='text'
                value={p.formatter(p.value)}
                step={p.step}
                onChange={e => change(p.attribute, p.parser(e.target.value))}
                disabled={!p.estimable || estimateAttribute === p.attribute}
                className={`w-24 ml-4 ${drawParamEntryWarnBorders(p)}`}
              />
              <Form.Check
                type='checkbox'
                label='Estimate'
                checked={estimateAttribute === p.attribute}
                onChange={() => setEstimateAttribute(p.attribute)} // It is not allowed to uncheck something.
                disabled={!p.estimable}
                className={`ml-2 ${!p.estimable ? 'invisible' : ''}`}
              />
            </div>
          </div>
        ))}
      </div>
      <button
        className='underline'
        onClick={() => {
          setEstimateAttribute('transmissibilityIncrease');
          setCurrentParams({
            ...defaultParams,
            transmissibilityIncrease: calc('transmissibilityIncrease', defaultParams),
          });
        }}
      >
        Reset
      </button>
    </>
  );
};
