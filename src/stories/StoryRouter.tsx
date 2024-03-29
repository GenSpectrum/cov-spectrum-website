import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

const StoryRouter = () => {
  let { storyId } = useParams();
  switch (storyId!.toLowerCase()) {
    default:
      return <Navigate to='/stories' />;
  }
};

export default StoryRouter;
