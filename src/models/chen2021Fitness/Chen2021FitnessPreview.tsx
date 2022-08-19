import React, { useState } from 'react';
import Loader from '../../components/Loader';
import { Chen2021ProportionPlot } from './Chen2021ProportionPlot';
import { useModelData } from './loading';
import { ChartAndMetricsWrapper, ChartWrapper, colors, Wrapper } from '../../widgets/common';
import Metric, { MetricsWrapper } from '../../widgets/Metrics';
import { ExternalLink } from '../../components/ExternalLink';
import { DateCountSampleDataset } from '../../data/sample/DateCountSampleDataset';
import { ExpandableTextBox } from '../../components/ExpandableTextBox';

type Props = {
  variantDateCounts: DateCountSampleDataset;
  wholeDateCounts: DateCountSampleDataset;
};

export const Chen2021FitnessPreview = ({ variantDateCounts, wholeDateCounts }: Props) => {
  const { isLoading, data } = useModelData(variantDateCounts, wholeDateCounts, {
    generationTime: 7,
  });
  const [showPlotAnyways, setShowPlotAnyways] = useState(false);

  if (!isLoading && !data) {
    return <>It was not possible to estimate the relative growth advantage.</>;
  }

  if (isLoading || !data) {
    return <Loader />;
  }

  const { response } = data;

  if (!showPlotAnyways && response.params.fd.ciUpper - response.params.fd.ciLower > 1) {
    return (
      <>
        <p>
          <b>There is not enough data to provide a reliable estimate.</b>
        </p>
        <div>
          <button className='underline' onClick={() => setShowPlotAnyways(true)}>
            I understand the danger and want to see the plot anyways.
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Wrapper>
        <ChartAndMetricsWrapper>
          <ChartWrapper>
            <Chen2021ProportionPlot
              modelData={response}
              variantDateCounts={variantDateCounts}
              wholeDateCounts={wholeDateCounts}
              showLegend={false}
            />
          </ChartWrapper>
          <MetricsWrapper>
            <Metric
              value={(response.params.fd.value * 100).toFixed(0)}
              title={'Current adv.'}
              helpText={
                'The estimated relative growth advantage per week (in percentage; 0% means equal growth).'
              }
              percent={true}
              color={colors.active}
            />
            <Metric
              value={
                Math.round(response.params.fd.ciLower * 100) +
                '-' +
                Math.round(response.params.fd.ciUpper * 100) +
                '%'
              }
              title={'Confidence int.'}
              helpText={'The 95% confidence interval'}
              color={colors.secondary}
            />
          </MetricsWrapper>
        </ChartAndMetricsWrapper>
        <div className='mt-8'>
          <h2>Reference</h2>
          <small>
            Chen, Chaoran, et al. "Quantification of the spread of SARS-CoV-2 variant B.1.1.7 in Switzerland."
            Epidemics (2021); doi:{' '}
            <ExternalLink url='https://doi.org/10.1016/j.epidem.2021.100480'>
              10.1016/j.epidem.2021.100480
            </ExternalLink>
          </small>
        </div>
      </Wrapper>
    </>
  );
};

export const Chen2021FitnessExplanation = () => {
  return (
    <ExpandableTextBox
      text={`If variants spread pre-dominantly by local transmission across demographic groups, this estimate reflects the relative viral intrinsic growth advantage of the focal variant in the selected country and time frame. We report the relative growth advantage per week (in percentage; 0% means equal growth). Importantly, the relative growth advantage estimate reflects the advantage compared to co-circulating strains. Thus, as new variants spread, the advantage of the focal variant may decrease. Three mechanisms can alter the intrinsic growth rate, namely an intrinsic transmission advantage, immune evasion, and a prolonged infectious period. The reported estimate, namely exp(a)-1 where a is the estimated logistic growth rate in units per week, takes all three mechanisms into account (Althaus, 2021). The logistic growth rate can be transformed into the individual contributions of the three mechanisms in the panel “Relative growth advantage: three mechanisms”. When absolute numbers of a variant are low, the growth advantage may merely reflect the current importance of introductions from abroad or the variant spreading in a particular demographic group. In this case, the estimate does not provide information on any intrinsic fitness advantages.

Example: Assume that 10 infections from the focal variant and 100 infections from the co-circulating variants occur today and that the focal variant has a relative growth advantage of 50%. Then, if the number of new infections from the co-circulating variants remain at 100 in a week from today, we expect the number of new infections from the focal variant to be 15.`}
      maxChars={80}
      keepNewLine={true}
    />
  );
};
