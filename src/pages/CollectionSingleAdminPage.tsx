import { useLocation, useParams } from 'react-router';
import { useQuery } from '../helpers/query-hook';
import { fetchCollections, updateCollection, validateCollectionAdminKey } from '../data/api';
import { useMemo, useState } from 'react';
import Loader from '../components/Loader';
import { Link } from 'react-router-dom';
import { Alert, AlertVariant, Button, ButtonVariant } from '../helpers/ui';
import { TextField } from '@mui/material';
import { Collection } from '../data/Collection';

export const CollectionSingleAdminPage = () => {
  const { collectionId: collectionIdStr }: { collectionId: string } = useParams();
  const collectionId = Number.parseInt(collectionIdStr);
  let queryParamsString = useLocation().search;
  const queryParam = useMemo(() => new URLSearchParams(queryParamsString), [queryParamsString]);
  // We expect the admin page component only being loaded when an admin key is provided.
  const adminKey = queryParam.get('adminKey')!;
  const url = process.env.REACT_APP_WEBSITE_HOST + '/collections/' + collectionId;

  // Validate admin key
  const { data: adminKeyIsValid } = useQuery(() => validateCollectionAdminKey(collectionId, adminKey), [
    collectionId,
    adminKey,
  ]);

  // Fetch collection
  const { data: collections } = useQuery(signal => fetchCollections(signal), []);
  const collection = useMemo(() => collections?.find(c => c.id === collectionId), [
    collectionId,
    collections,
  ]);

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

  if (!adminKeyIsValid) {
    return (
      <div className='mx-8 my-4'>
        <h1>{collection.title}</h1>
        <Alert variant={AlertVariant.DANGER}>
          <h2>Authentication failed</h2>
          <p>The provided admin key is wrong.</p>
        </Alert>
      </div>
    );
  }

  return (
    <div className='mx-8 my-4'>
      <h1>{collection.title}</h1>
      <Alert variant={AlertVariant.WARNING}>
        <h2>Admin area</h2>
        <p>
          This is the administration area of the collection. Please save the following link to access the area
          again in the future. Keep it secret as everyone with the link can edit and delete the collection.
        </p>
        <TextField
          label='Admin link'
          variant='standard'
          className='mt-2 my-4 w-100'
          value={url + '?adminKey=' + adminKey}
        />
        <p>Use the following link to view the collection:</p>
        <TextField label='View link' variant='standard' className='mt-2 my-4 w-100' value={url} />
      </Alert>
      <AdminPanel collection={collection} adminKey={adminKey} />
    </div>
  );
};

type AdminPanelProps = {
  collection: Collection;
  adminKey: string;
};

const AdminPanel = ({ collection, adminKey }: AdminPanelProps) => {
  const [title, setTitle] = useState(collection.title);
  const [description, setDescription] = useState(collection.description);
  const [maintainers, setMaintainers] = useState(collection.maintainers);
  const [email, setEmail] = useState(collection.email);
  const [variants, setVariants] = useState(collection.variants);

  const submit = async () => {
    await updateCollection(
      {
        id: collection.id,
        title,
        description,
        maintainers,
        email,
        variants,
      },
      adminKey
    );
  };

  return (
    <>
      <div className='flex flex-col' style={{ maxWidth: 400 }}>
        <TextField
          label='Title'
          variant='standard'
          className='mt-4'
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <TextField
          label='Description'
          variant='standard'
          multiline
          rows={4}
          className='mt-4'
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <TextField
          label='Maintainers'
          variant='standard'
          className='mt-4'
          value={maintainers}
          onChange={e => setMaintainers(e.target.value)}
        />
        <TextField
          label='Contact email'
          variant='standard'
          className='mt-4'
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>
      <Button variant={ButtonVariant.PRIMARY} className='w-48 mt-8' onClick={() => submit()}>
        Save changes
      </Button>

      <h2>Variants</h2>
      <div className='mt-4'></div>
    </>
  );
};
