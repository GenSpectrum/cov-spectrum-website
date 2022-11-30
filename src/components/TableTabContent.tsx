import { DataGrid, GridColDef, GridComparatorFn, GridRenderCellParams } from '@mui/x-data-grid';
import { useEffect, useState, useMemo } from 'react';
import { AiFillStar } from 'react-icons/ai';
import { Dataset } from '../data/Dataset';
import { DateRangeSelector } from '../data/DateRangeSelector';
import { dateRangeUrlFromSelector } from '../data/DateRangeUrlEncoded';
import { LocationDateVariantSelector } from '../data/LocationDateVariantSelector';
import { encodeLocationSelectorToSingleString, LocationSelector } from '../data/LocationSelector';
import { DateCountSampleEntry } from '../data/sample/DateCountSampleEntry';
import {
  addVariantSelectorToUrlSearchParams,
  formatVariantDisplayName,
  VariantSelector,
} from '../data/VariantSelector';
import { PromiseQueue } from '../helpers/PromiseQueue';
import { Chen2021FitnessResponse, ValueWithCI } from '../models/chen2021Fitness/chen2021Fitness-types';
import { getModelData } from '../models/chen2021Fitness/loading';
import { HashLink as Link } from 'react-router-hash-link';
import Loader from '../components/Loader';
import { Button, ButtonVariant } from '../helpers/ui';
import { csvStringify } from '../helpers/csvStringifyHelper';
import download from 'downloadjs';

type TableTabContentProps = {
  collectionId: number;
  locationSelector: LocationSelector;
  variants: { query: VariantSelector; name: string; description: string }[];
  variantsDateCounts: PromiseSettledResult<Dataset<LocationDateVariantSelector, DateCountSampleEntry[]>>[];
  variantsNumberNewSequences: PromiseSettledResult<number>[];
  allWholeDateCounts: PromiseSettledResult<Dataset<LocationDateVariantSelector, DateCountSampleEntry[]>>[];
  dateRangeSelector: DateRangeSelector;
};

export default function TableTabContent({
  collectionId,
  locationSelector,
  variants,
  variantsDateCounts,
  variantsNumberNewSequences,
  allWholeDateCounts,
  dateRangeSelector,
}: TableTabContentProps) {
  // Fetch relative growth advantage
  const [relativeAdvantages, setRelativeAdvantages] = useState<
    (Chen2021FitnessResponse | undefined | 'failed')[]
  >([]);
  useEffect(() => {
    const fetchQueue = new PromiseQueue(10);
    for (let i = 0; i < variantsDateCounts.length; i++) {
      const variantDateCountsStatus = variantsDateCounts[i];
      const allWholeDateCountsStatus = allWholeDateCounts[i];
      const setFailedFunc = (prev: (Chen2021FitnessResponse | undefined | 'failed')[]) => {
        const newArr = [...prev];
        newArr[i] = 'failed';
        return newArr;
      };
      if (variantDateCountsStatus.status === 'rejected' || allWholeDateCountsStatus.status === 'rejected') {
        fetchQueue.addTask(() => {
          return new Promise<void>(resolve => {
            setRelativeAdvantages(setFailedFunc);
            resolve();
          });
        });
        continue;
      }
      const variantDateCounts = variantDateCountsStatus.value;
      const wholeDateCounts = allWholeDateCountsStatus.value;
      const totalSequences = variantDateCounts.payload.reduce((prev, curr) => prev + curr.count, 0);
      fetchQueue.addTask(() => {
        if (totalSequences > 0) {
          return getModelData(variantDateCounts, wholeDateCounts, { generationTime: 7 }).then(
            ({ response }) => {
              if (response === undefined) {
                setRelativeAdvantages(setFailedFunc);
              } else {
                setRelativeAdvantages(prev => {
                  const newArr = [...prev];
                  newArr[i] = response;
                  return newArr;
                });
              }
            }
          );
        } else {
          // No need to calculate the advantage if there is no available sequence
          return new Promise<void>(resolve => {
            setRelativeAdvantages(setFailedFunc);
            resolve();
          });
        }
      });
    }
  }, [variantsDateCounts, allWholeDateCounts, setRelativeAdvantages]);

  // Table definition and data
  const tableColumns: GridColDef[] = [
    {
      field: 'highlighted',
      headerName: '',
      width: 40,
      minWidth: 40,
      renderCell: (params: GridRenderCellParams<string>) => {
        const highlighted = params.row.highlighted;
        return highlighted ? <AiFillStar size='1.5em' className='text-yellow-400' /> : <></>;
      },
    },
    {
      field: 'name',
      headerName: 'Name',
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<string>) => {
        const query = params.row.query;
        const urlParams = new URLSearchParams();
        addVariantSelectorToUrlSearchParams(query, urlParams);

        const placeString = encodeLocationSelectorToSingleString(locationSelector);
        return params.value ? (
          <Link
            to={`/explore/${placeString}/AllSamples/${dateRangeUrlFromSelector(
              dateRangeSelector
            )}/variants?${urlParams.toString()}`}
            className='overflow-hidden'
          >
            <button className='underline break-words overflow-hidden w-full'>{params.value}</button>
          </Link>
        ) : (
          <></>
        );
      },
    },
    {
      field: 'queryFormatted',
      headerName: 'Query',
      minWidth: 300,
      renderCell: (params: GridRenderCellParams<string>) => {
        return <span className='break-words overflow-hidden'>{params.value}</span>;
      },
    },
    { field: 'total', headerName: 'Number sequences', minWidth: 150, type: 'number' },
    { field: 'newSequences', headerName: 'Submitted in past 10 days', minWidth: 200, type: 'number' },
    {
      field: 'advantage',
      headerName: 'Relative growth advantage',
      minWidth: 200,
      sortComparator: sortRelativeGrowthAdvantageValues,
    },
    {
      field: 'advantageCiLower',
      headerName: 'CI (low)',
      minWidth: 100,
      sortComparator: sortRelativeGrowthAdvantageValues,
    },
    {
      field: 'advantageCiUpper',
      headerName: 'CI (high)',
      minWidth: 100,
      sortComparator: sortRelativeGrowthAdvantageValues,
    },
    { field: 'description', headerName: 'Description', minWidth: 450 },
  ];

  const variantTableData = useMemo(() => {
    return variants.map((variant, i) => {
      let advantage = undefined;
      let errorMessage: string | undefined = undefined;
      const relativeAdvantage: Chen2021FitnessResponse | 'failed' | undefined = relativeAdvantages[i];
      if (relativeAdvantage === 'failed') {
        errorMessage = "Can't be calculated";
      } else if (relativeAdvantage === undefined) {
        errorMessage = 'Calculating...';
      } else {
        advantage = relativeAdvantage.params.fd;
      }
      const vcd = variantsDateCounts[i];
      const vnns = variantsNumberNewSequences[i];
      if (vcd.status === 'fulfilled') {
        if (vnns.status !== 'fulfilled') {
          // Strange that one request was successful but the other one wasn't
          throw new Error('Unexpected error');
        }
        return {
          id: i,
          ...variant,
          name: variant.name.length > 0 ? variant.name : formatVariantDisplayName(variant.query),
          queryFormatted: formatVariantDisplayName(variant.query),
          total: vcd.value.payload.reduce((prev, curr) => prev + curr.count, 0),
          newSequences: vnns.value,
          advantage: errorMessage ?? ((advantage as ValueWithCI).value * 100).toFixed(2) + '%',
          advantageCiLower: errorMessage
            ? '...'
            : ((advantage as ValueWithCI).ciLower * 100).toFixed(2) + '%',
          advantageCiUpper: errorMessage
            ? '...'
            : ((advantage as ValueWithCI).ciUpper * 100).toFixed(2) + '%',
        };
      } else {
        return {
          id: i,
          ...variant,
          name: variant.name.length > 0 ? variant.name : formatVariantDisplayName(variant.query),
          queryFormatted: formatVariantDisplayName(variant.query),
          total: vcd.reason,
          newSequences: '-',
          advantage: '-',
          advantageCiLower: '-',
          advantageCiUpper: '-',
        };
      }
    });
  }, [variants, variantsDateCounts, variantsNumberNewSequences, relativeAdvantages]);

  const downloadAsCsv = () => {
    const csvData = variantTableData.map(x => ({
      name: x.name,
      query: x.queryFormatted,
      number_sequences: x.total,
      submitted_past_10_days: x.newSequences,
      relative_growth_advantage: x.advantage,
      relative_growth_advantage_low: x.advantageCiLower,
      relative_growth_advantage_high: x.advantageCiUpper,
      description: x.description,
    }));
    download(csvStringify(csvData), `collection-${collectionId}.csv`, 'text/csv');
  };

  return (
    <>
      {variantTableData ? (
        <>
          <Button variant={ButtonVariant.PRIMARY} className='w-40' onClick={downloadAsCsv}>
            Download CSV
          </Button>
          <div className='mt-4'>
            <DataGrid
              columns={tableColumns}
              rows={variantTableData}
              autoHeight={true}
              getRowHeight={() => 'auto'}
              density={'compact'}
            />
          </div>
        </>
      ) : (
        <Loader />
      )}
    </>
  );
}

const sortRelativeGrowthAdvantageValues: GridComparatorFn<string> = (a, b) => {
  if (!a.endsWith('%') && !b.endsWith('%')) {
    return 0;
  }
  if (!a.endsWith('%')) {
    return -1;
  }
  if (!b.endsWith('%')) {
    return 1;
  }
  const aNumber = Number.parseFloat(a.substr(0, a.length - 1));
  const bNumber = Number.parseFloat(b.substr(0, a.length - 1));
  return aNumber - bNumber;
};
