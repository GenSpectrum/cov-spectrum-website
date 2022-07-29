import { useLocation } from 'react-router';
import { useMemo } from 'react';
import { CollectionSingleAdminPage } from './CollectionSingleAdminPage';
import { CollectionSingleViewPage } from './CollectionSingleViewPage';

export const CollectionSinglePage = () => {
  let queryParamsString = useLocation().search;
  const queryParam = useMemo(() => new URLSearchParams(queryParamsString), [queryParamsString]);
  const adminMode = queryParam.has('adminKey');

  return adminMode ? <CollectionSingleAdminPage /> : <CollectionSingleViewPage />;
};
