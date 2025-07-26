import React from 'react';
import { Link } from 'react-router';

type Props = {
  path: string;
  children?: React.ReactNode;
};

export const InternalLink = ({ path, children }: Props) => {
  return (
    <Link to={path} className='text-active-secondary'>
      {children ? children : path}
    </Link>
  );
};
