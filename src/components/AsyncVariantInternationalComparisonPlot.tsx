import React from 'react';
import { AsyncState } from 'react-async';
import { SampleSetWithSelector } from '../helpers/sample-set';
import { Alert, AlertVariant } from '../helpers/ui';
import { Country } from '../services/api-types';
import { VariantInternationalComparisonPlotWidget } from '../widgets/VariantInternationalComparisonPlot';
import Loader from './Loader';
import { NamedCard } from './NamedCard';

interface Props {
  title: string;
  toolbarChildren: JSX.Element;
  height: number;
  country: Country;
  logScale?: boolean;
  variantInternationalSampleSetState: AsyncState<SampleSetWithSelector>;
  wholeInternationalSampleSetState: AsyncState<SampleSetWithSelector>;
}

export const AsyncVariantInternationalComparisonPlot = ({
  title,
  toolbarChildren,
  height,
  variantInternationalSampleSetState,
  wholeInternationalSampleSetState,
  ...restProps
}: Props) => {
  const makePlaceholderCard = (content: JSX.Element) => (
    <NamedCard title={title} toolbar={toolbarChildren}>
      <div style={{ height }}>{content}</div>
    </NamedCard>
  );

  if (
    variantInternationalSampleSetState.status === 'initial' ||
    variantInternationalSampleSetState.status === 'pending' ||
    wholeInternationalSampleSetState.status === 'initial' ||
    wholeInternationalSampleSetState.status === 'pending'
  ) {
    return makePlaceholderCard(<Loader />);
  }

  if (
    variantInternationalSampleSetState.status === 'rejected' ||
    wholeInternationalSampleSetState.status === 'rejected'
  ) {
    return makePlaceholderCard(<Alert variant={AlertVariant.DANGER}>Failed to load samples</Alert>);
  }

  return (
    <VariantInternationalComparisonPlotWidget.ShareableComponent
      {...restProps}
      height={height}
      title={title}
      toolbarChildren={toolbarChildren}
      variantInternationalSampleSet={variantInternationalSampleSetState.data}
      wholeInternationalSampleSet={wholeInternationalSampleSetState.data}
    />
  );
};
