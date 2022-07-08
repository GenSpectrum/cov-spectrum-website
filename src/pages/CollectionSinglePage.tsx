import { useParams } from 'react-router';

export const CollectionSinglePage = () => {
  const { collectionId: collectionIdStr }: { collectionId: string } = useParams();
  const collectionId = Number.parseInt(collectionIdStr);

  return <>CollectionSinglePage {collectionId}</>;
};
