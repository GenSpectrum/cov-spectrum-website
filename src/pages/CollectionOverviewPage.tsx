import { useQuery } from '../helpers/query-hook';
import { fetchCollections } from '../data/api';
import Loader from '../components/Loader';
import { Button, ButtonVariant } from '../helpers/ui';
import { Link } from 'react-router-dom';

export const CollectionOverviewPage = () => {
  const { data } = useQuery(
    signal => fetchCollections(signal).then(collections => collections.sort((a, b) => b.id! - a.id!)),
    []
  );

  return (
    <div className='mx-8 my-4'>
      <h1>Collections</h1>
      <div>
        With the new <strong>CoV-Spectrum Collections</strong>, users can create their own lists of variants.
        On the dedicated Collections pages, you can easily get an overview of the chosen variants.
      </div>
      <Link to='/collections/add'>
        <Button variant={ButtonVariant.PRIMARY} className='w-full sm:w-96 my-4'>
          Create a new collection
        </Button>
      </Link>
      <h2>Existing collections</h2>
      {data ? (
        <div>
          <ul className='list-disc'>
            {data.map(c => (
              <li className='ml-8' key={c.id}>
                <Link to={`collections/${c.id}`}>{c.title}</Link> (by {c.maintainers})
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <Loader />
      )}
    </div>
  );
};
