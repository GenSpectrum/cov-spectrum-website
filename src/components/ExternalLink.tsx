import React from 'react';

type Props = {
  url: string;
  label?: string;
  newWindow?: boolean;
  children?: React.ReactNode;
};

export const ExternalLink = ({ url, children, newWindow = true, label }: Props) => {
  return (
    <a
      href={url}
      title={label}
      target={newWindow ? '_blank' : '_self'}
      rel='noreferrer'
      className='text-active-secondary'
    >
      {children ? children : url}
    </a>
  );
};
