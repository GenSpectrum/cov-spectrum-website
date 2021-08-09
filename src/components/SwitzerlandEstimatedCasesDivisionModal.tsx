import { ParsedMultiSample, SampleSet, SampleSetWithSelector } from '../helpers/sample-set';
import {
  SequencingIntensityEntrySet,
  SequencingIntensityEntrySetWithSelector,
} from '../helpers/sequencing-intensity-entry-set';
import { getCaseCounts } from '../services/api';
import React, { useEffect, useMemo, useState } from 'react';
import { AlmostFullscreenModal } from './AlmostFullscreenModal';
import { CaseCountEntry } from '../services/api-types';
import { Utils } from '../services/Utils';
import { GridCell, PackedGrid } from './PackedGrid';
import { EstimatedCasesPlotWidget } from '../widgets/EstimatedCasesPlot';
import Loader from './Loader';
import { globalDateCache } from '../helpers/date-cache';
import { fillFromDailyMap } from '../helpers/fill-missing';
import { cantonToRegion, mapParsedMultiSample } from '../helpers/switzerland-regions';
import { Alert, AlertVariant } from '../helpers/ui';
import { useQuery } from 'react-query'

type Props = {
  variantSampleSet: SampleSetWithSelector;
  wholeSampleSet: SampleSetWithSelector;
  show: boolean;
  handleClose: () => void;
};

type Data = {
  division: string;
  variantSampleSet: SampleSetWithSelector;
  sequencingIntensityEntrySet: SequencingIntensityEntrySetWithSelector;
}[];

const toSequencingIntensityEntrySet = (
  wholeSampleSet: ParsedMultiSample[],
  caseCounts: CaseCountEntry[]
): SequencingIntensityEntrySet => {
  const samplesByDate = Utils.groupBy(wholeSampleSet, sample => sample.date);
  const casesByDate = Utils.groupBy(
    caseCounts.filter(({ date }) => !!date),
    entry => globalDateCache.getDay(entry.date!)
  );
  const filledCasesByDate = fillFromDailyMap(casesByDate, []);
  let data = filledCasesByDate.map(({ key: date }) => ({
    x: date.string,
    y: {
      numberCases: casesByDate.get(date)?.reduce((sum, entry) => sum + entry.count, 0) ?? 0,
      numberSequenced: samplesByDate.get(date)?.reduce((sum, entry) => sum + entry.count, 0) ?? 0,
    },
  }));
  return { data };
};

const processData = (
  variantSampleSet: SampleSetWithSelector,
  wholeSampleSet: SampleSetWithSelector,
  caseCounts: CaseCountEntry[]
): Data => {
  const divisionVariantSampleSetMap = variantSampleSet.groupByField('division');
  const divisionWholeSampleSetMap = wholeSampleSet.groupByField('division');
  const divisionCaseCountMap = Utils.groupBy(caseCounts, entry => entry.division);
  return [...divisionVariantSampleSetMap.keys()]
    .filter(
      division => !!division && divisionCaseCountMap.has(division) && divisionWholeSampleSetMap.has(division)
    )
    .sort()
    .map(division => ({
      division: division!,
      variantSampleSet: new SampleSet(
        divisionVariantSampleSetMap.get(division)!,
        variantSampleSet.sampleSelector
      ),
      sequencingIntensityEntrySet: {
        data: toSequencingIntensityEntrySet(
          divisionWholeSampleSetMap.get(division)!,
          divisionCaseCountMap.get(division)!
        ).data,
        selector: {
          country: 'Switzerland',
          samplingStrategy: variantSampleSet.sampleSelector.dataType,
        },
      },
    }));
};

export const SwitzerlandEstimatedCasesDivisionModal = ({
  variantSampleSet,
  wholeSampleSet,
  show,
  handleClose,
}: Props) => {
  //const [caseCounts, setCaseCounts] = useState<CaseCountEntry[] | undefined>();
  const [showSwissRegions, setShowSwissRegions] = useState(true);
  const { dateFrom, dateTo, country } = variantSampleSet.sampleSelector;

  const fetchCaseCounts = async () => {
    const data = await getCaseCounts({ dateFrom, dateTo, country }, true, new AbortController().signal);
    return data;
  };

  const { isLoading, isSuccess, error, isError, data: caseCounts, isFetching } = useQuery<CaseCountEntry[], Error>(
      "caseCounts",
      fetchCaseCounts
  );

  useEffect(() => {
    let isSubscribed = true;
    const controller = new AbortController();
    const signal = controller.signal;

    // getCaseCounts({ dateFrom, dateTo, country }, true, signal).then(caseCounts => {
    //   if (isSubscribed) {
    //     setCaseCounts(caseCounts);
    //   }
    // });

    return () => {
      isSubscribed = false;
      controller.abort();
    };
  }, [dateFrom, dateTo, country]);

  const { cantonData, regionData } = useMemo(() => {
    if (!caseCounts) {
      return { cantonData: undefined, regionData: undefined };
    }
    const regionVariantSampleSet = new SampleSet(
      mapParsedMultiSample([...variantSampleSet.getAll()]),
      variantSampleSet.sampleSelector
    );
    const regionWholeSampleSet = new SampleSet(
      mapParsedMultiSample([...wholeSampleSet.getAll()]),
      wholeSampleSet.sampleSelector
    );
    const regionCaseCounts = caseCounts.map(entry => ({
      ...entry,
      division: entry.division ? cantonToRegion(entry.division) ?? null : null,
    }));
    return {
      cantonData: processData(variantSampleSet, wholeSampleSet, caseCounts),
      regionData: processData(regionVariantSampleSet, regionWholeSampleSet, regionCaseCounts),
    };
  }, [caseCounts, variantSampleSet, wholeSampleSet]);

  return (
    <AlmostFullscreenModal show={show} handleClose={handleClose} header='Estimated cases'>
      <Alert variant={AlertVariant.INFO}>
        We use a different case numbers dataset for the regional/cantonal plots. It shows slightly lower
        numbers than the dataset we use for the country-wide plots.
      </Alert>
      <div className='ml-4'>
        <span
          className={showSwissRegions ? 'font-bold' : 'underline cursor-pointer'}
          onClick={() => setShowSwissRegions(true)}
        >
          Show regions
        </span>{' '}
        |{' '}
        <span
          className={!showSwissRegions ? 'font-bold' : 'underline cursor-pointer'}
          onClick={() => setShowSwissRegions(false)}
        >
          Show cantons
        </span>
      </div>

      {isLoading && <Loader />}
      {isError && error &&
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error.message}</span>
        </div>
      }

      {isSuccess && cantonData && regionData && (
        <PackedGrid maxColumns={3}>
          {(showSwissRegions ? regionData : cantonData).map(d => {
            return (
              <GridCell minWidth={600} key={d.division}>
                <EstimatedCasesPlotWidget.ShareableComponent
                  variantSampleSet={d.variantSampleSet}
                  sequencingIntensityEntrySet={d.sequencingIntensityEntrySet}
                  title={d.division}
                  showExport={false}
                  height={300}
                />
              </GridCell>
            );
          })}
        </PackedGrid>
      )}
    </AlmostFullscreenModal>
  );
};
