import React, { useState } from 'react';
import { InternationalComparisonTable } from './InternationalComparisonTable';
import { MinimalWidgetLayout } from './MinimalWidgetLayout';
import { CountryDateCountSampleDataset } from '../data/sample/CountryDateCountSampleDataset';
import { VariantInternationalComparisonChartWidget } from '../widgets/VariantInternationalComparisonChartWidget';
import { LocationSelector } from '../data/LocationSelector';
interface Props {
  locationSelector: LocationSelector;
  variantInternationalDateCountDataset: CountryDateCountSampleDataset;
  wholeInternationalDateCountDataset: CountryDateCountSampleDataset;
}
export const InternationalComparison = ({
  variantInternationalDateCountDataset,
  wholeInternationalDateCountDataset,
  locationSelector,
}: Props) => {
  const [logScale, setLogScale] = useState<boolean>(false);
  console.log('values are');
  console.log(wholeInternationalDateCountDataset);
  console.log(variantInternationalDateCountDataset);
  return (
    <>
      <VariantInternationalComparisonChartWidget.ShareableComponent
        title='International comparison'
        variantInternationalSampleSet={variantInternationalDateCountDataset}
        wholeInternationalSampleSet={wholeInternationalDateCountDataset}
        preSelectedCountries={locationSelector.country ? [locationSelector.country] : []}
        widgetLayout={MinimalWidgetLayout}
        height={300}
        logScale={logScale}
      />
      <InternationalComparisonTable
        variantInternationalDateCountDataset={variantInternationalDateCountDataset}
      />
    </>
  );
};
