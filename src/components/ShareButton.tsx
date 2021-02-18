import { Button } from 'react-bootstrap';
import React, { useContext } from 'react';
import { ShareButtonContext } from './WidgetWrapper';

export const ShareButton = () => {
  const { onShare } = useContext(ShareButtonContext);

  if (!onShare) {
    return null;
  }

  return (
    <Button variant='outline-primary' size='sm' onClick={onShare}>
      Share
    </Button>
  );
};
