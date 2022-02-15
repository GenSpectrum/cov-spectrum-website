import React from 'react';
import { Redirect, useParams } from 'react-router';
import Omicron from './Omicron';

const StoryRouter = () => {
  let { storyId }: { storyId: string } = useParams();
  switch (storyId.toLowerCase()) {
    case 'omicron':
      return <Omicron />;
    default:
      return <Redirect to='/stories' />;
  }
};

export default StoryRouter;
