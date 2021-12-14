import React, { useMemo, useState } from 'react';
import Loader from '../../components/Loader';
import { Chen2021ProportionPlot } from './Chen2021ProportionPlot';
import { fillRequestWithDefaults, useModelData } from './loading';
import { ChartAndMetricsWrapper, ChartWrapper, colors, Wrapper } from '../../widgets/common';
import Metric, { MetricsWrapper } from '../../widgets/Metrics';
import { LocationSelector } from '../../data/LocationSelector';
import { VariantSelector } from '../../data/VariantSelector';
import { SamplingStrategy } from '../../data/SamplingStrategy';
import { DateRangeSelector } from '../../data/DateRangeSelector';
import { ExternalLink } from '../../components/ExternalLink';

type Props = {
  locationSelector: LocationSelector;
  dateRangeSelector: DateRangeSelector;
  variantSelector: VariantSelector;
  samplingStrategy: SamplingStrategy;
};

export const Chen2021FitnessPreview = ({
  locationSelector,
  dateRangeSelector,
  variantSelector,
  samplingStrategy,
}: Props) => {
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
              'The estimated relative growth advantage under a discrete model assuming a generation time of 4.8 days ' +
              'using data from the past 3 months.'
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
