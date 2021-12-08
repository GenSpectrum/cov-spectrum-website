import React, { useMemo } from 'react';
import Loader from '../../components/Loader';
import { Chen2021ProportionPlot } from './Chen2021ProportionPlot';
import { fillRequestWithDefaults, useModelData } from './loading';
import { ChartAndMetricsWrapper, ChartWrapper, colors, Wrapper } from '../../widgets/common';
import Metric, { MetricsWrapper } from '../../widgets/Metrics';
import { LocationSelector } from '../../data/LocationSelector';
import { VariantSelector } from '../../data/VariantSelector';
import { SamplingStrategy } from '../../data/SamplingStrategy';

type Props = {
  locationSelector: LocationSelector;
  variantSelector: VariantSelector;
  samplingStrategy: SamplingStrategy;
};

export const Chen2021FitnessPreview = ({ locationSelector, variantSelector, samplingStrategy }: Props) => {
  const request = useMemo(
    () => fillRequestWithDefaults({ locationSelector, variantSelector, samplingStrategy }),
    [locationSelector, variantSelector, samplingStrategy]
  );

  const { modelData, loading } = useModelData(request);

  if (loading) {
    return <Loader />;
  }

  if (!modelData || modelData.params.fd.ciUpper - modelData.params.fd.ciLower > 1) {
    return <>There is not enough data to provide a useful estimate.</>;
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
