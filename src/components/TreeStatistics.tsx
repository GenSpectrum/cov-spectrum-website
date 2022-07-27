import { LapisSelector } from '../data/LapisSelector';
import { useQuery } from '../helpers/query-hook';
import { fetchGenbankAccessions } from '../data/api-lapis';
import { fetchMrca } from '../data/api-cladeness';
import Loader from './Loader';
import { ExpandableTextBox } from './ExpandableTextBox';

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

  return mrcaResult ? (
    <div>
      <div>
        {mrcaResult.notFound.length} sequences are missing in the tree:{' '}
        <ExpandableTextBox text={mrcaResult.notFound.join(', ')} maxChars={300} />
      </div>
      <div className='mt-4'>MRCA: {mrcaResult.result}</div>
    </div>
  ) : (
    <Loader />
  );
};
