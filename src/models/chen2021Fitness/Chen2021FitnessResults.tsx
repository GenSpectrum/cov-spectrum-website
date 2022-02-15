import React from 'react';
import Loader from '../../components/Loader';
import { Chen2021AbsolutePlot } from './Chen2021AbsolutePlot';
import { ChangePoint, ChangePointWithFc, Chen2021FitnessRequest } from './chen2021Fitness-types';
import { Chen2021ProportionPlot } from './Chen2021ProportionPlot';
import { formatValueWithCI } from './format-value';
import { getData } from './loading';
import { GridCell, PackedGrid } from '../../components/PackedGrid';
import { NamedCard } from '../../components/NamedCard';
import { useQuery } from '../../helpers/query-hook';
import { UnifiedDay } from '../../helpers/date-cache';
import { DateCountSampleDataset } from '../../data/sample/DateCountSampleDataset';

type ResultsProps = {
  request: Chen2021FitnessRequest;
  t0: UnifiedDay;
  variantDateCounts: DateCountSampleDataset;
  wholeDateCounts: DateCountSampleDataset;
  changePoints: ChangePoint[];
};

const Info = ({ title, children }: { title: string; children: React.ReactNode }) => {
  return (
    <div className='mx-3 bg-white shadow-lg mb-6 mt-4 rounded-xl p-4'>
      <h2 className='text-md mb-2 mt-0'>{title}</h2>
      <p>{children}</p>
    </div>
  );
};

export const Chen2021FitnessResults = ({
  request,
  t0,
  variantDateCounts,
  wholeDateCounts,
  changePoints,
}: ResultsProps) => {
  const { data: mainData, isLoading: mainIsLoading } = useQuery(
    signal => getData(request, t0, signal),
    [request]
  );

  // Calculate fitness advantage values for change points
  const { data: changePointsData, isLoading: changePointsIsLoading } = useQuery(
    signal => {
      const _changePoints = changePoints;
      const _requests: Chen2021FitnessRequest[] = _changePoints.map(cp => ({
        data: request.data,
        config: {
          ...request.config,
          reproductionNumberWildtype: cp.reproductionNumberWildtype,
        },
      }));
      return Promise.all(_requests.map(req => getData(req, t0, signal))).then(_responses => {
        const _changePointsResults: ChangePointWithFc[] = [];
        for (let i = 0; i < _responses.length; i++) {
          const _response = _responses[i];
          if (_response === undefined) {
            return undefined;
          }
          _changePointsResults.push({
            ..._changePoints[i],
            fc: _response.params.fc,
          });
        }
        return _changePointsResults;
      });
    },
    [changePoints, request, t0]
  );

  if (mainIsLoading || changePointsIsLoading) {
    return <Loader />;
  }

  if (!mainData || !changePointsData) {
    return <>A relative growth advantage cannot be estimated for this variant.</>;
  }

  return (
    <>
      <Info title=''>
        <div>Logistic growth rate a: {formatValueWithCI(mainData.params.a)}</div>
        {/*TODO t_0 is currently difficult (or impossible?) to interpret.*/}
        {/*<div>Sigmoid's midpoint t_0: {modelData && formatValueWithCI(modelData.params.t0, 0)}</div>*/}
        <div>
          Relative growth advantage f<sub>c</sub>: {formatValueWithCI(mainData.params.fc)}
        </div>
        {changePointsData.map(({ date, fc }) => (
          <>
            Relative growth advantage f<sub>c</sub> after {date.toISOString().substring(0, 10)}:{' '}
            {formatValueWithCI(fc)}
          </>
        ))}
        <div>
          Relative growth advantage f<sub>d</sub>: {formatValueWithCI(mainData.params.fd)}
        </div>
      </Info>

      <PackedGrid maxColumns={2}>
        <GridCell minWidth={600}>
          <NamedCard title='Proportion'>
            <div style={{ height: 500 }}>
              <Chen2021ProportionPlot
                modelData={mainData}
                variantDateCounts={variantDateCounts}
                wholeDateCounts={wholeDateCounts}
              />
            </div>
          </NamedCard>
        </GridCell>
        <GridCell minWidth={600}>
          <NamedCard title='Absolute'>
            <div style={{ height: 500 }}>
              <Chen2021AbsolutePlot
                modelData={mainData}
                request={request}
                t0={t0}
                changePoints={changePointsData}
              />
            </div>
          </NamedCard>
        </GridCell>
      </PackedGrid>
    </>
  );
};
