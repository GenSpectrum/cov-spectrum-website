import { LapisSelector } from '../data/LapisSelector';
import { useQuery } from '../helpers/query-hook';
import { fetchGenbankAccessions } from '../data/api-lapis';
import { fetchClusters, fetchMrca } from '../data/api-cladeness';
import Loader from './Loader';
import { ExpandableTextBox } from './ExpandableTextBox';
import { CladenessCluster } from '../data/cladeness-types';
import { ExternalLink } from './ExternalLink';

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
      <div className='flex flex-row items-center'>
        {cluster.node}{' '}
        <ExternalLink
          url={`https://taxonium.org/?treeUrl=https%3A%2F%2Fcladeness.cov-spectrum.org%2Ftree.nwk.gz&ladderizeTree=true&srch=%5B%7B%22key%22%3A%22aa1%22%2C%22type%22%3A%22name%22%2C%22method%22%3A%22text_match%22%2C%22text%22%3A%22${cluster.node}%22%2C%22gene%22%3A%22S%22%2C%22position%22%3A484%2C%22new_residue%22%3A%22any%22%2C%22min_tips%22%3A0%7D%5D`}
        >
          <img src='/img/taxonium.png' className='mx-2 w-4 h-4' />
        </ExternalLink>{' '}
        (size: {cluster.statistics.size}, cladeness: {(cluster.statistics.cladeness * 100).toFixed(2)}%)
      </div>
      <div className='ml-8'>
        {cluster.children?.map(child => (
          <Cluster cluster={child} key={child.node} />
        ))}
      </div>
    </>
  );
};
