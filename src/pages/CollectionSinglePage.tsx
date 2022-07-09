import { useParams } from 'react-router';
import { useQuery } from '../helpers/query-hook';
import { fetchCollections } from '../data/api';
import { useMemo } from 'react';
import Loader from '../components/Loader';
import { Link } from 'react-router-dom';
import { Button, ButtonVariant } from '../helpers/ui';
import { formatVariantDisplayName, VariantSelector } from '../data/VariantSelector';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { DateCountSampleData } from '../data/sample/DateCountSampleDataset';
import { SamplingStrategy } from '../data/SamplingStrategy';

export const CollectionSinglePage = () => {
  const { collectionId: collectionIdStr }: { collectionId: string } = useParams();
  const collectionId = Number.parseInt(collectionIdStr);

  // Fetch collection
  const { data: collections } = useQuery(signal => fetchCollections(signal), []);
  const collection = useMemo(() => collections?.find(c => c.id === collectionId), [
    collectionId,
    collections,
  ]);
  const variants = useMemo(
    () =>
      collection
        ? collection.variants.map(v => ({
            ...v,
            query: JSON.parse(v.query) as VariantSelector,
          }))
        : undefined,
    [collection]
  );

  // Fetch data about the variants
  const { data: variantsDateCounts } = useQuery(
    signal =>
      variants
        ? Promise.all(
            variants.map(variant =>
              DateCountSampleData.fromApi(
                {
                  host: undefined,
                  qc: {},
                  location: {},
                  variant: variant.query,
                  samplingStrategy: SamplingStrategy.AllSamples,
                },
                signal
              )
            )
          )
        : Promise.resolve(undefined),
    [variants]
  );

  // Variant table
  const variantTableData = useMemo(() => {
    if (!variants || !variantsDateCounts) {
      return undefined;
    }
    return variants.map((variant, i) => {
      return {
        id: i,
        ...variant,
        name: variant.name.length > 0 ? variant.name : formatVariantDisplayName(variant.query),
        total: variantsDateCounts[i].payload.reduce((prev, curr) => prev + curr.count, 0),
      };
    });
  }, [variants, variantsDateCounts]);

  // Rendering
  if (!collections) {
    return <Loader />;
  }

  if (!collection) {
    return (
      <div className='mx-8 my-4'>
        <h1>Collection not found</h1>
        <p>The collection does not exist.</p>

        <Link to='/collections'>
          <Button variant={ButtonVariant.PRIMARY} className='w-48 my-4'>
            Go back to overview
          </Button>
        </Link>
      </div>
    );
  }

  if (!variantTableData) {
    return <Loader />;
  }

  const tableColumns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      minWidth: 150,
      renderCell: (params: GridRenderCellParams<string>) => {
        return params.value ? (
          <Link to={`${encodeURIComponent(params.value)}`}>
            <button className='underline'>
              <span className='w-60 text-ellipsis overflow-hidden block text-left'>{params.value}</span>
            </button>
          </Link>
        ) : (
          <></>
        );
      },
    },
    { field: 'description', headerName: 'Description', minWidth: 300 },
    { field: 'total', headerName: 'Number sequences', minWidth: 150 },
  ];

  return (
    <div className='mx-8 my-4'>
      <h1>{collection.title}</h1>
      <p className='italic'>Maintained by {collection.maintainers}</p>
      <p className='whitespace-pre-wrap'>{collection.description}</p>
      <h2>Variants</h2>
      <div className='mt-4'>
        <DataGrid columns={tableColumns} rows={variantTableData} autoHeight={true} density={'compact'} />
      </div>
    </div>
  );
};
