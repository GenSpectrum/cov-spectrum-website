import React from 'react';
import { Redirect, useParams } from 'react-router';
import B11 from './B11';

const Story = () => {
  let { storyId }: { storyId: string } = useParams();
  console.log(storyId);
  switch (storyId) {
    case 'b11':
      return <B11 />;
    default:
      return <Redirect to='/stories' />;
  }
};

export default Story;
