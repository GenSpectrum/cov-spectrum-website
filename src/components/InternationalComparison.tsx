import React, { useState } from 'react';
import { Alert, Button } from 'react-bootstrap';
import { SampleSetWithSelector } from '../helpers/sample-set';
import { AccountService } from '../services/AccountService';
import { SamplingStrategy, toLiteralSamplingStrategy } from '../services/api';
import { Country, Variant } from '../services/api-types';
import { NextcladeService } from '../services/NextcladeService';
import { VariantInternationalComparisonPlotWidget } from '../widgets/VariantInternationalComparisonPlot';
import { InternationalComparisonTable } from './InternationalComparisonTable';
import { LazySampleButton } from './LazySampleButton';
import { MinimalWidgetLayout } from './MinimalWidgetLayout';

interface Props {
  country: Country;
  matchPercentage: number;
  variant: Variant;
  samplingStrategy: SamplingStrategy;
  variantInternationalSampleSet: SampleSetWithSelector;
  wholeInternationalSampleSet: SampleSetWithSelector;
}

export const InternationalComparison = ({
  country,
  matchPercentage,
  variant,
  samplingStrategy: requestedSamplingStrategy,
  variantInternationalSampleSet,
  wholeInternationalSampleSet,
}: Props) => {
  const [logScale, setLogScale] = useState<boolean>(false);

  if (requestedSamplingStrategy !== SamplingStrategy.AllSamples) {
    return (
      <Alert variant='warning'>
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
            <Button variant='secondary' size='sm' className='ml-1' onClick={() => setLogScale(v => !v)}>
              Toggle log scale
            </Button>
            {AccountService.isLoggedIn() && (
              <Button
                variant='secondary'
                size='sm'
                className='ml-1'
                onClick={() =>
                  NextcladeService.showVariantOnNextclade({
                    variant,
                    matchPercentage,
                    country: undefined,
                    samplingStrategy: toLiteralSamplingStrategy(SamplingStrategy.AllSamples),
                  })
                }
              >
                Show on Nextclade
              </Button>
            )}
            <LazySampleButton
              query={{
                variantSelector: { variant, matchPercentage },
                country: undefined,
                samplingStrategy: SamplingStrategy.AllSamples,
              }}
              variant='secondary'
              size='sm'
              className='ml-1'
            >
              Show worldwide samples
            </LazySampleButton>
          </>
        }
      />

      <InternationalComparisonTable
        matchPercentage={matchPercentage}
        variant={variant}
        variantInternationalSampleSet={variantInternationalSampleSet}
      />
    </>
  );
};
