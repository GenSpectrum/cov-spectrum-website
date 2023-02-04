import React from 'react';
import { Navigate, useParams } from 'react-router';
import Omicron from './Omicron';

const StoryRouter = () => {
  let { storyId } = useParams();
  switch (storyId!.toLowerCase()) {
    case 'omicron':
      return <Omicron />;
    default:
      return <Navigate to='/stories' />;
  }
};

export default StoryRouter;
