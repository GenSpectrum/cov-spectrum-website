import React, { useState } from 'react';
import { SampleSetWithSelector } from '../helpers/sample-set';
import { Alert, AlertVariant, Button, ButtonVariant } from '../helpers/ui';
import { AccountService } from '../services/AccountService';
import { SamplingStrategy, toLiteralSamplingStrategy } from '../services/api';
import { Country, DateRange, Variant } from '../services/api-types';
import { NextcladeIntegration } from '../services/external-integrations/NextcladeIntegration';
import { VariantInternationalComparisonPlotWidget } from '../widgets/VariantInternationalComparisonPlot';
import { InternationalComparisonTable } from './InternationalComparisonTable';
import { LazySampleButton } from './LazySampleButton';
import { MinimalWidgetLayout } from './MinimalWidgetLayout';

interface Props {
  country: Country;
  matchPercentage: number;
  variant: Variant;
  samplingStrategy: SamplingStrategy;
  dateRange: DateRange;
  variantInternationalSampleSet: SampleSetWithSelector;
  wholeInternationalSampleSet: SampleSetWithSelector;
}

export const InternationalComparison = ({
  country,
  matchPercentage,
  variant,
  samplingStrategy: requestedSamplingStrategy,
  dateRange,
  variantInternationalSampleSet,
  wholeInternationalSampleSet,
}: Props) => {
  const [logScale, setLogScale] = useState<boolean>(false);

  if (requestedSamplingStrategy !== SamplingStrategy.AllSamples) {
    return (
      <Alert variant={AlertVariant.WARNING}>
        The selected sampling strategy can not be used for international comparison. Use "All samples"
        instead.
      </Alert>
    );
  }

  return (
    <>
      <VariantInternationalComparisonPlotWidget.ShareableComponent
        title='International comparison'
        widgetLayout={MinimalWidgetLayout}
        height={300}
        country={country}
        logScale={logScale}
        variantInternationalSampleSet={variantInternationalSampleSet}
        wholeInternationalSampleSet={wholeInternationalSampleSet}
        toolbarChildren={
          <>
            <Button
              variant={ButtonVariant.SECONDARY}
              className='mt-1 ml-2'
              onClick={() => setLogScale(v => !v)}
            >
              Toggle log scale
            </Button>
            {AccountService.isLoggedIn() && (
              <>
                <Button
                  variant={ButtonVariant.SECONDARY}
                  className='ml-1 mt-1'
                  onClick={() =>
                    new NextcladeIntegration().open({
                      variant,
                      matchPercentage,
                      country: undefined,
                      samplingStrategy: toLiteralSamplingStrategy(SamplingStrategy.AllSamples),
                    })
                  }
                >
                  Show on Nextclade
                </Button>
                <LazySampleButton
                  query={{
                    variantSelector: { variant, matchPercentage },
                    country: undefined,
                    samplingStrategy: SamplingStrategy.AllSamples,
                    dateRange,
                  }}
                  variant='secondary'
                  size='sm'
                  className='ml-1'
                >
                  Show worldwide samples
                </LazySampleButton>
              </>
            )}
          </>
        }
      />

      <InternationalComparisonTable
        dateRange={dateRange}
        matchPercentage={matchPercentage}
        variant={variant}
        variantInternationalSampleSet={variantInternationalSampleSet}
      />
    </>
  );
};
