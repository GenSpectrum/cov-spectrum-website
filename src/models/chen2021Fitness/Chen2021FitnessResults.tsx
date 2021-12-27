import React from 'react';
import Loader from '../../components/Loader';
import { Chen2021AbsolutePlot } from './Chen2021AbsolutePlot';
import { Chen2021FitnessRequest } from './chen2021Fitness-types';
import { Chen2021ProportionPlot } from './Chen2021ProportionPlot';
import { formatValueWithCI } from './format-value';
import { useModelData } from './loading';
import { GridCell, PackedGrid } from '../../components/PackedGrid';
import { NamedCard } from '../../components/NamedCard';

type ResultsProps = {
  request: Chen2021FitnessRequest;
};

const Info = ({ title, children }: { title: string; children: React.ReactNode }) => {
  return (
    <div className='mx-3 bg-white shadow-lg mb-6 mt-4 rounded-xl p-4'>
      <h2 className='text-md mb-2 mt-0'>{title}</h2>
      <p>{children}</p>
    </div>
  );
};

export const Chen2021FitnessResults = ({ request }: ResultsProps) => {
  const { modelData, loading } = useModelData(request);

  if (loading) {
    return <Loader />;
  }

  if (!modelData) {
    return <>A relative growth advantage cannot be estimated for this variant.</>;
  }

  return (
    <>
      <Info title=''>
        <div>Logistic growth rate a: {formatValueWithCI(modelData.params.a)}</div>
        {/*TODO t_0 is currently difficult (or impossible?) to interpret.*/}
        {/*<div>Sigmoid's midpoint t_0: {modelData && formatValueWithCI(modelData.params.t0, 0)}</div>*/}
        <div>
          Relative growth advantage f<sub>c</sub>: {formatValueWithCI(modelData.params.fc)}
        </div>
        {modelData.changePoints?.map(({ t, fc }) => (
          <>
            Relative growth advantage f<sub>c</sub> after {t}: {formatValueWithCI(fc)}
          </>
        ))}
        <div>
          Relative growth advantage f<sub>d</sub>: {formatValueWithCI(modelData.params.fd)}
        </div>
      </Info>

      <PackedGrid maxColumns={2}>
        <GridCell minWidth={600}>
          <NamedCard title='Proportion'>
            <Chen2021ProportionPlot
              modelData={modelData}
              plotStartDate={request.plotStartDate}
              plotEndDate={request.plotEndDate}
            />
          </NamedCard>
        </GridCell>
        <GridCell minWidth={600}>
          <NamedCard title='Absolute'>
            <Chen2021AbsolutePlot modelData={modelData} request={request} />
          </NamedCard>
        </GridCell>
      </PackedGrid>
    </>
  );
};
