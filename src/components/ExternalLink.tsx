import React from 'react';

type Props = {
  url: string;
  children?: React.ReactNode;
};

export const ExternalLink = ({ url, children }: Props) => {
  return (
    <a href={url} target='_blank' rel='noreferrer' className='text-active-secondary'>
      {children ? children : url}
    </a>
  );
};
