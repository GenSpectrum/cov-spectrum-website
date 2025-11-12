import React from 'react';

type ExternalLinkProps = {
  url: string;
  label?: string;
  newWindow?: boolean;
  children?: React.ReactNode;
};

export const ExternalLink = ({ url, children, newWindow = true, label }: ExternalLinkProps) => {
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

type ExternalLinkAsyncProps = {
  urlFunc: () => Promise<string>;
  label?: string;
  newWindow?: boolean;
  children?: React.ReactNode;
};

export const ExternalLinkAsync = ({ urlFunc, children, newWindow = true, label }: ExternalLinkAsyncProps) => {
  return (
    <button
      title={label}
      className='text-active-secondary'
      onClick={async () => {
        const url = await urlFunc();
        window.open(url, newWindow ? '_blank' : '_self');
      }}
    >
      {children ? children : label}
    </button>
  );
};
