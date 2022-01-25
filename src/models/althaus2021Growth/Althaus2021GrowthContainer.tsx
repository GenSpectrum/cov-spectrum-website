import { Althaus2021GrowthParameterPanel } from './Althaus2021GrowthParameterPanel';
import { ExpandableTextBox } from '../../components/ExpandableTextBox';
import { Althaus2021GrowthParameters } from './althaus2021Growth-types';
import React, { useState } from 'react';
import { useModelData } from '../chen2021Fitness/loading';
import Loader from '../../components/Loader';
import { ExternalLink } from '../../components/ExternalLink';
import { DateCountSampleDataset } from '../../data/sample/DateCountSampleDataset';

export type ContainerProps = {
  variantDateCounts: DateCountSampleDataset;
  wholeDateCounts: DateCountSampleDataset;
};

export const Althaus2021GrowthContainer = ({ variantDateCounts, wholeDateCounts }: ContainerProps) => {
  // We can use the same methods as chen2021Fitness to compute the logistic growth rate.
  const { isLoading, data } = useModelData(variantDateCounts, wholeDateCounts);
  const [showPlotAnyways, setShowPlotAnyways] = useState(false);

  if (isLoading) {
    return <Loader />;
  }

  if (!data) {
    return <>It was not possible to estimate the relative growth advantage.</>;
  }

  const res = data.response;

  if (!showPlotAnyways && res.params.fd.ciUpper - res.params.fd.ciLower > 1) {
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

  const logisticGrowthRate = res.params.a;
  const defaultParams: Althaus2021GrowthParameters = {
    growthRate: logisticGrowthRate.value,
    transmissibilityIncrease: 0.6,
    durationIncrease: 0,
    immuneEvasion: 0,
    susceptiblesProportion: 0.5,
    reproductionNumberWildtype: 1,
    generationTime: 5.2,
  };

  const formatGrowthVal = (value: number): string => value.toFixed(2);

  return (
    <>
      <div className='mb-6'>
        <ExpandableTextBox
          text='
        Assuming local transmissions and random sampling, there are three main mechanisms to explain the relative growth
        of a variant: an increase in transmissibility, an increase of infectious duration, and immune evasion. Further,
        in this model, these values depend on the proportion of population susceptible to the wildtype (the background
        variant that we compare to), the reproduction number of the wildtype, and the generation time of the wildtype.
        The following calculator can be used to estimate one parameter given the others. The increase in
        transmissibility and the increase of infectious duration are given as relative factors: i.e., the variant is
        (1+τ)x as transmissible as the wildtype and the infection duration is (1+κ)x as long. An immune evasion of 0
        means complete cross-protection, a value of 1 corresponds to full evasion. The growth rate and generation time
        are reported in days.
      '
          maxChars={120}
        />
      </div>
      <div className='mb-6'>
        <b>
          Estimated logistic growth rate (per day): {formatGrowthVal(logisticGrowthRate.value)} [
          {formatGrowthVal(logisticGrowthRate.ciLower)}, {formatGrowthVal(logisticGrowthRate.ciUpper)}]
        </b>
      </div>
      <Althaus2021GrowthParameterPanel growthRate={logisticGrowthRate} defaultParams={defaultParams} />
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
