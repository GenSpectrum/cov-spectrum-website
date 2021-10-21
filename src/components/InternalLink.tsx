import React from 'react';
import { HashLink } from 'react-router-hash-link';

type Props = {
  path: string;
  children?: React.ReactNode;
};

export const InternalLink = ({ path, children }: Props) => {
  // We use HashLink instead of React Router's Link because Link does not support anchor/hash links correctly. See:
  //   - https://github.com/remix-run/react-router/issues/394#issuecomment-220221604
  //   - https://github.com/rafgraph/react-router-hash-link
  return (
    <HashLink to={path} className='text-active-secondary'>
      {children ? children : path}
    </HashLink>
  );
};
