import React from 'react';
import Loader from '../../components/Loader';
import { Chen2021AbsolutePlot } from './Chen2021AbsolutePlot';
import { Chen2021FitnessRequest } from './chen2021Fitness-types';
import { Chen2021ProportionPlot } from './Chen2021ProportionPlot';
import { formatValueWithCI } from './format-value';
import { getData } from './loading';
import { GridCell, PackedGrid } from '../../components/PackedGrid';
import { NamedCard } from '../../components/NamedCard';
import { useQuery } from '../../helpers/query-hook';
import { UnifiedDay } from '../../helpers/date-cache';

type ResultsProps = {
  request: Chen2021FitnessRequest;
  t0: UnifiedDay;
};

const Info = ({ title, children }: { title: string; children: React.ReactNode }) => {
  return (
    <div className='mx-3 bg-white shadow-lg mb-6 mt-4 rounded-xl p-4'>
      <h2 className='text-md mb-2 mt-0'>{title}</h2>
      <p>{children}</p>
    </div>
  );
};

export const Chen2021FitnessResults = ({ request, t0 }: ResultsProps) => {
  const { data, isLoading } = useQuery(signal => getData(request, t0, signal), [request]);

  if (isLoading) {
    return <Loader />;
  }

  if (!data) {
    return <>A relative growth advantage cannot be estimated for this variant.</>;
  }

  return (
    <>
      <Info title=''>
        <div>Logistic growth rate a: {formatValueWithCI(data.params.a)}</div>
        {/*TODO t_0 is currently difficult (or impossible?) to interpret.*/}
        {/*<div>Sigmoid's midpoint t_0: {modelData && formatValueWithCI(modelData.params.t0, 0)}</div>*/}
        <div>
          Relative growth advantage f<sub>c</sub>: {formatValueWithCI(data.params.fc)}
        </div>
        {/*{modelData.changePoints?.map(({ t, fc }) => (*/}
        {/*  <>*/}
        {/*    Relative growth advantage f<sub>c</sub> after {t}: {formatValueWithCI(fc)}*/}
        {/*  </>*/}
        {/*))}*/}
        <div>
          Relative growth advantage f<sub>d</sub>: {formatValueWithCI(data.params.fd)}
        </div>
      </Info>

      <PackedGrid maxColumns={2}>
        <GridCell minWidth={600}>
          <NamedCard title='Proportion'>
            <div style={{ height: 500 }}>
              <Chen2021ProportionPlot
                modelData={data}
                plotStartDate={t0.dayjs.add(request.config.tStart, 'day').toDate()}
                plotEndDate={t0.dayjs.add(request.config.tEnd, 'day').toDate()}
              />
            </div>
          </NamedCard>
        </GridCell>
        <GridCell minWidth={600}>
          <NamedCard title='Absolute'>
            <div style={{ height: 500 }}>
              <Chen2021AbsolutePlot modelData={data} request={request} t0={t0} />
            </div>
          </NamedCard>
        </GridCell>
      </PackedGrid>
    </>
  );
};
