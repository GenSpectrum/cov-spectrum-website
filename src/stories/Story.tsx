import React from 'react';
import { useParams } from 'react-router';

const Story = () => {
  let { storyId }: { storyId: string } = useParams();
  console.log(storyId);
  return (
    <div>
      <h1>Story id = {storyId}</h1>
    </div>
  );
};

export default Story;
