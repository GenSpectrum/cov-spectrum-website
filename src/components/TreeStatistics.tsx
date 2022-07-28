import { LapisSelector } from '../data/LapisSelector';
import { useQuery } from '../helpers/query-hook';
import { fetchGenbankAccessions } from '../data/api-lapis';
import { fetchClusters, fetchMrca } from '../data/api-cladeness';
import Loader from './Loader';
import { ExpandableTextBox } from './ExpandableTextBox';
import { CladenessCluster } from '../data/cladeness-types';

type Props = {
  selector: LapisSelector;
};

export const TreeStatistics = ({ selector }: Props) => {
  const { data: accessions } = useQuery(signal => fetchGenbankAccessions(selector, signal), [selector]);

  const { data: mrcaResult } = useQuery(
    signal => {
      if (!accessions) {
        return Promise.resolve(undefined);
      }
      return fetchMrca(accessions, signal);
    },
    [accessions]
  );
  const { data: clustersResult } = useQuery(
    signal => {
      if (!accessions) {
        return Promise.resolve(undefined);
      }
      return fetchClusters(accessions, signal);
    },
    [accessions]
  );

  return mrcaResult && clustersResult ? (
    <div>
      <div>
        {mrcaResult.notFound.length} sequences are missing in the tree:{' '}
        <ExpandableTextBox text={mrcaResult.notFound.join(', ')} maxChars={300} />
      </div>
      <div className='mt-4'>
        <span className='font-bold'>MRCA:</span> {mrcaResult.result}
      </div>
      <div className='mt-4'>
        <div className='font-bold'>Clusters:</div>
        <Cluster cluster={clustersResult.result} />
      </div>
    </div>
  ) : (
    <Loader />
  );
};

const Cluster = ({ cluster }: { cluster: CladenessCluster }) => {
  return (
    <>
      <div>
        {cluster.node} (size: {cluster.statistics.size}, cladeness:{' '}
        {(cluster.statistics.cladeness * 100).toFixed(2)}%)
      </div>
      <div className='ml-8'>
        {cluster.children?.map(child => (
          <Cluster cluster={child} key={child.node} />
        ))}
      </div>
    </>
  );
};
