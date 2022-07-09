import { TextField } from '@mui/material';
import { Button, ButtonVariant } from '../helpers/ui';
import { useState } from 'react';
import { addCollection } from '../data/api';
import { useHistory } from 'react-router';

export const CollectionAddPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [maintainers, setMaintainers] = useState('');
  const [email, setEmail] = useState('');
  const history = useHistory();

  const submit = async () => {
    const response = await addCollection({
      title,
      description,
      maintainers,
      email,
      variants: [],
    });
    history.push(`/collections/${response.id}?adminKey=${response.adminKey}`);
  };

  return (
    <div className='mx-8 my-4'>
      <h1>Add Collection</h1>
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
        Create
      </Button>
    </div>
  );
};
