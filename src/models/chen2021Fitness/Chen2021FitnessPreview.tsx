import React, { useState } from 'react';
import Loader from '../../components/Loader';
import { Chen2021ProportionPlot } from './Chen2021ProportionPlot';
import { useModelData } from './loading';
import { ChartAndMetricsWrapper, ChartWrapper, colors, Wrapper } from '../../widgets/common';
import Metric, { MetricsWrapper } from '../../widgets/Metrics';
import { ExternalLink } from '../../components/ExternalLink';
import { DateCountSampleDataset } from '../../data/sample/DateCountSampleDataset';

type Props = {
  variantDateCounts: DateCountSampleDataset;
  wholeDateCounts: DateCountSampleDataset;
};

export const Chen2021FitnessPreview = ({ variantDateCounts, wholeDateCounts }: Props) => {
  const { isLoading, data } = useModelData(variantDateCounts, wholeDateCounts);
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
              'The estimated relative growth advantage under a discrete model assuming a generation time of 4.8 days ' +
              'using data from the past 3 months.'
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
  );
};
