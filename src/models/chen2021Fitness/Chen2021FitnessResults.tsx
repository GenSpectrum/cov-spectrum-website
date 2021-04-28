import React from 'react';
import Loader from '../../components/Loader';
import { Chen2021AbsolutePlot } from './Chen2021AbsolutePlot';
import { Chen2021FitnessRequest } from './chen2021Fitness-types';
import { Chen2021ProportionPlot } from './Chen2021ProportionPlot';
import { formatValueWithCI } from './format-value';
import { useModelData } from './loading';
import { GridCell, PackedGrid } from '../../components/PackedGrid';

type ResultsProps = {
  request: Chen2021FitnessRequest;
};

export const Chen2021FitnessResults = ({ request }: ResultsProps) => {
  const { modelData, loading } = useModelData(request);

  if (loading) {
    return <Loader />;
  }

  if (!modelData) {
    return <>A fitness advantage cannot be estimated for this variant.</>;
  }

  return (
    <>
      <div>Logistic growth rate a: {modelData && formatValueWithCI(modelData.params.a)}</div>
      {/*TODO t_0 is currently difficult (or impossible?) to interpret.*/}
      {/*<div>Sigmoid's midpoint t_0: {modelData && formatValueWithCI(modelData.params.t0, 0)}</div>*/}
      <div>Fitness advantage f_c: {modelData && formatValueWithCI(modelData.params.fc)}</div>
      <div>Fitness advantage f_d: {modelData && formatValueWithCI(modelData.params.fd)}</div>
      <PackedGrid maxColumns={2}>
        <GridCell minWidth={600}>
          <Chen2021ProportionPlot
            modelData={modelData}
            plotStartDate={request.plotStartDate}
            plotEndDate={request.plotEndDate}
          />
        </GridCell>
        <GridCell minWidth={600}>
          <Chen2021AbsolutePlot modelData={modelData} />
        </GridCell>
      </PackedGrid>
    </>
  );
};
