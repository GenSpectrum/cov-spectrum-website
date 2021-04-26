import React, { useMemo } from 'react';
import * as zod from 'zod';
import Loader from '../../components/Loader';
import { OldSampleSelectorSchema } from '../../helpers/sample-selector';
import { Chen2021ProportionPlot } from './Chen2021ProportionPlot';
import { fillRequestWithDefaults, useModelData } from './loading';
import { ChartAndMetricsWrapper, ChartWrapper, colors, Wrapper } from '../../charts/common';
import Metric, { MetricsSpacing, MetricsWrapper } from '../../charts/Metrics';

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
    return <>A fitness advantage cannot be estimated for this variant.</>;
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
          <MetricsSpacing />
          <Metric
            value={(modelData.params.fc.value * 100).toFixed(2)}
            title={'Fitness adv.'}
            helpText={'The estimated fitness advantage under a continuous model'}
            percent={true}
            color={colors.active}
          />
          <Metric
            value={
              Math.round(modelData.params.fc.ciLower * 100) +
              '-' +
              Math.round(modelData.params.fc.ciUpper * 100) +
              '%'
            }
            fontSize='small'
            title={'Confidence interval'}
            helpText={'The 95% confidence interval'}
            color={colors.secondary}
          />
        </MetricsWrapper>
      </ChartAndMetricsWrapper>
    </Wrapper>
  );
};
