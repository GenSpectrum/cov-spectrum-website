import React, { useMemo } from 'react';
import * as zod from 'zod';
import Loader from '../../components/Loader';
import { OldSampleSelectorSchema } from '../../helpers/sample-selector';
import { Chen2021ProportionPlot } from './Chen2021ProportionPlot';
import { fillRequestWithDefaults, useModelData } from './loading';
import { ChartAndMetricsWrapper, ChartWrapper, colors, Wrapper } from '../../charts/common';
import Metric, { MetricsWrapper } from '../../charts/Metrics';

type Props = zod.infer<typeof OldSampleSelectorSchema>;

export const Chen2021FitnessPreview = ({
  country,
  mutations,
  matchPercentage,
  pangolinLineage,
  samplingStrategy,
}: Props) => {
  const request = useMemo(
    () => fillRequestWithDefaults({ country, mutations, matchPercentage, pangolinLineage, samplingStrategy }),
    [country, mutations, matchPercentage, pangolinLineage, samplingStrategy]
  );

  const { modelData, loading } = useModelData(request);

  if (loading) {
    return <Loader />;
  }

  if (!modelData) {
    return <>A transmission advantage cannot be estimated for this variant.</>;
  }

  return (
    <Wrapper>
      <ChartAndMetricsWrapper>
        <ChartWrapper>
          <Chen2021ProportionPlot
            modelData={modelData}
            plotStartDate={request.plotStartDate}
            plotEndDate={request.plotEndDate}
            showLegend={false}
          />
        </ChartWrapper>
        <MetricsWrapper>
          <Metric
            value={(modelData.params.fd.value * 100).toFixed(0)}
            title={'Current adv.'}
            helpText={
              'The estimated transmission advantage under a discrete model assuming a generation time of 4.8 days using data from the past 3 months.'
            }
            percent={true}
            color={colors.active}
          />
          <Metric
            value={
              Math.round(modelData.params.fd.ciLower * 100) +
              '-' +
              Math.round(modelData.params.fd.ciUpper * 100) +
              '%'
            }
            title={'Confidence int.'}
            helpText={'The 95% confidence interval'}
            color={colors.secondary}
          />
        </MetricsWrapper>
      </ChartAndMetricsWrapper>
    </Wrapper>
  );
};
