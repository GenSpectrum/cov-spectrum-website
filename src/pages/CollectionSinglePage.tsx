import { useLocation } from 'react-router';
import { useMemo } from 'react';
import { CollectionSingleAdminPage } from './CollectionSingleAdminPage';
import { CollectionSingleViewPage } from './CollectionSingleViewPage';
import { Link } from 'react-router-dom';

export const CollectionSinglePage = () => {
  let queryParamsString = useLocation().search;
  const queryParam = useMemo(() => new URLSearchParams(queryParamsString), [queryParamsString]);
  const adminMode = queryParam.has('adminKey');

  return (
    <>
      <div className='mx-8 mt-4' style={{ marginBottom: '-0.5rem' }}>
        <Link to='../collections'>&lt; Return to all collections</Link>
      </div>
      <div className='mx-8 mb-4'>
        {adminMode ? <CollectionSingleAdminPage /> : <CollectionSingleViewPage />}
      </div>
    </>
  );
};
