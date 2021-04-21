import React, { useMemo } from 'react';
import * as zod from 'zod';
import Loader from '../../components/Loader';
import { OldSampleSelectorSchema } from '../../helpers/sample-selector';
import { Chen2021ProportionPlot } from './Chen2021ProportionPlot';
import { fillRequestWithDefaults, useModelData } from './loading';

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
    <Chen2021ProportionPlot
      modelData={modelData}
      plotStartDate={request.plotStartDate}
      plotEndDate={request.plotEndDate}
    />
  );
};
