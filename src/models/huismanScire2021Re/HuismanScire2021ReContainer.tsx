import { DateCountSampleDataset } from '../../data/sample/DateCountSampleDataset';
import { CaseCountAsyncDataset } from '../../data/CaseCountDataset';
import { prepareData } from '../../widgets/EstimatedCasesChart';
import React, { useMemo, useState } from 'react';
import Loader from '../../components/Loader';
import { useQuery } from '../../helpers/query-hook';
import { getResult, triggerCalculation } from './loading';
import { HuismanScire2021ReResultResponse } from './types';
import { HuismanScire2021ReChart } from './HuismanScire2021ReChart';
import { calculatePlotData, EstimatedCasesPlotEntry } from '../../widgets/EstimatedCasesChartInner';
import { Utils } from '../../services/Utils';
import { ExpandableTextBox } from '../../components/ExpandableTextBox';
import { ExternalLink } from '../../components/ExternalLink';

type Props = {
  wholeDateCounts: DateCountSampleDataset;
  variantDateCounts: DateCountSampleDataset;
  caseCounts: CaseCountAsyncDataset;
};

export const HuismanScire2021ReContainer = ({ wholeDateCounts, variantDateCounts, caseCounts }: Props) => {
  // Estimate cases
  const estimatedCaseData: EstimatedCasesPlotEntry[] | undefined = useMemo(() => {
    const preparedData = prepareData(variantDateCounts, wholeDateCounts, caseCounts);
    if (!preparedData) {
      return undefined;
    }
    const estimatedCasesTimeEntries = [...preparedData.values()];
    const casesPlotData = calculatePlotData(estimatedCasesTimeEntries);
    return casesPlotData.plotData;
  }, [caseCounts, variantDateCounts, wholeDateCounts]);

  // Fetch the Re estimates if they are already available
  let { isLoading: preExistingIsLoading, data: preExistingData } = useQuery(
    signal => {
      if (!estimatedCaseData) {
        return Promise.resolve(undefined);
      }
      return getResult(estimatedCaseData, signal);
    },
    [estimatedCaseData]
  );

  const [calculationTriggered, setCalculationTriggered] = useState(false);
  const [newlyCalculatedData, setNewlyCalculatedData] = useState<
    HuismanScire2021ReResultResponse | undefined
  >();
  const [calculationQueueFull, setCalculationQueueFull] = useState(false);
  const calculate = async () => {
    if (!estimatedCaseData) {
      return;
    }
    const dataAtTheBeginning = estimatedCaseData;
    setCalculationTriggered(true);
    let calculateResponse = await triggerCalculation(estimatedCaseData);
    if (calculateResponse.state === 'REJECTED_FULL_QUEUE') {
      setCalculationQueueFull(true);
      return;
    }
    if (calculateResponse.state === 'OK') {
      while (true) {
        if (dataAtTheBeginning !== estimatedCaseData) {
          break; // Not entirely sure whether this could happen - but just to be sure.
        }
        let result = await getResult(estimatedCaseData);
        if (result.state === 'RESULT_UNAVAILABLE') {
          await Utils.sleep(15000);
          continue;
        }
        setNewlyCalculatedData(result);
        setCalculationTriggered(false);
        break;
      }
    }
  };

  const data = newlyCalculatedData || preExistingData;

  if (preExistingIsLoading || !preExistingData || !data) {
    return <Loader />;
  }

  if (calculationQueueFull) {
    return (
      <>
        There are currently too many Re calculation requests and we do not have sufficient capacity to accept
        more requests. Please try it later again.
      </>
    );
  }

  if (calculationTriggered) {
    return (
      <>
        Calculating.. This can take up to ten minutes. The plot will be automatically loaded once the results
        are available.
      </>
    );
  }

  if (data.state === 'RESULT_AVAILABLE' && data.result) {
    return (
      <>
        <ExpandableTextBox text='Description: TODO' maxChars={80} />
        <HuismanScire2021ReChart data={data.result} />
        <div>
          <h2>Reference</h2>
          <small>
            Huisman, Jana S., Scire, Jérémie, et al. "Estimation and worldwide monitoring of the effective
            reproductive number of SARS-CoV-2." medRxiv (2021); doi:{' '}
            <ExternalLink url='https://doi.org/10.1101/2020.11.26.20239368'>
              10.1101/2020.11.26.20239368
            </ExternalLink>
          </small>
        </div>
      </>
    );
  }

  if (data.state === 'CALCULATION_FAILED') {
    return <>It was not possible to estimate the Re.</>;
  }

  if (data.state === 'RESULT_UNAVAILABLE') {
    return (
      <>
        The Re has not been estimated.{' '}
        <button onClick={() => calculate()} className='underline'>
          Click here to estimate it.
        </button>{' '}
        Please note that the calculation can take up to ten minutes.
      </>
    );
  }

  throw new Error('Unexpected case in HuismanScire2021ReContainer');
};
