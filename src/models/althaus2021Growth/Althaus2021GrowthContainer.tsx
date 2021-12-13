import { Althaus2021GrowthParameterPanel } from './Althaus2021GrowthParameterPanel';
import { LocationSelector } from '../../data/LocationSelector';
import { VariantSelector } from '../../data/VariantSelector';
import { SamplingStrategy } from '../../data/SamplingStrategy';
import { DateRangeSelector } from '../../data/DateRangeSelector';
import { ExpandableTextBox } from '../../components/ExpandableTextBox';
import { Althaus2021GrowthParameters } from './althaus2021Growth-types';
import React, { useMemo, useState } from 'react';
import { fillRequestWithDefaults, useModelData } from '../chen2021Fitness/loading';
import Loader from '../../components/Loader';
import { ExternalLink } from '../../components/ExternalLink';

export type ContainerProps = {
  locationSelector: LocationSelector;
  dateRangeSelector: DateRangeSelector;
  variantSelector: VariantSelector;
  samplingStrategy: SamplingStrategy;
};

const defaultParams: Althaus2021GrowthParameters = {
  transmissibilityIncrease: 0.6,
  durationIncrease: 0,
  immuneEvasion: 0,
  susceptiblesProportion: 0.5,
  reproductionNumberWildtype: 1,
  generationTime: 5.2,
};

export const Althaus2021GrowthContainer = ({
  locationSelector,
  dateRangeSelector,
  variantSelector,
  samplingStrategy,
}: ContainerProps) => {
  // We can use the same methods as chen2021Fitness to compute the logistic growth rate.
  const request = useMemo(
    () => fillRequestWithDefaults({ locationSelector, dateRangeSelector, variantSelector, samplingStrategy }),
    [locationSelector, dateRangeSelector, variantSelector, samplingStrategy]
  );
  const { modelData, loading } = useModelData(request);
  const [showPlotAnyways, setShowPlotAnyways] = useState(false);

  if (loading) {
    return <Loader />;
  }

  if (!modelData) {
    return <>It was not possible to estimate the relative growth advantage.</>;
  }

  if (!showPlotAnyways && modelData.params.fd.ciUpper - modelData.params.fd.ciLower > 1) {
    return (
      <>
        <p>
          <b>There is not enough data to provide a reliable estimate.</b>
        </p>
        <div>
          <button className='underline' onClick={() => setShowPlotAnyways(true)}>
            I understand the danger and want to use the widget anyways.
          </button>
        </div>
      </>
    );
  }

  const logisticGrowthRate = modelData.params.a;

  return (
    <>
      <div className='mb-6'>
        <ExpandableTextBox
          text='
        This is a long description.
      '
          maxChars={60}
        />
      </div>
      <div className='mb-6'>
        <b>
          Estimated logistic growth rate: {logisticGrowthRate.value.toFixed(4)} [
          {logisticGrowthRate.ciLower.toFixed(4)}, {logisticGrowthRate.ciUpper.toFixed(4)}]
        </b>
      </div>
      <Althaus2021GrowthParameterPanel growthRate={logisticGrowthRate.value} defaultParams={defaultParams} />
      <div className='mt-4'>
        <h2>Reference</h2>
        <small>
          Althaus, Christian L., et al. "A tale of two variants: Spread of SARS-CoV-2 variants Alpha in
          Geneva, Switzerland, and Beta in South Africa." medRxiv (2021); doi:{' '}
          <ExternalLink url='https://doi.org/10.1101/2021.06.10.21258468'>
            10.1101/2021.06.10.21258468
          </ExternalLink>
        </small>
      </div>
    </>
  );
};
