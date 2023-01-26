import { useQuery } from './helpers/query-hook';
import { fetchNextcladeDatasetInfo } from './data/api-lapis';
import { usePangoLineageWithAlias } from './services/pangoLineageAlias';
import { Link } from 'react-router-dom';

export function TestComponent({ link }: { link: string }) {
  const { data: nextcladeDatasetInfo } = useQuery(() => fetchNextcladeDatasetInfo(), []);
  let alias = usePangoLineageWithAlias('BA.1');

  return (
    <>
      {alias}
      <br />
      {JSON.stringify(nextcladeDatasetInfo)}
      <br />
      <Link to={link}>{link}</Link>
    </>
  );
}
