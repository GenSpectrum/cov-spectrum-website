import React from 'react';

interface Props {
  title: string;
  children: React.ReactChild | React.ReactChild[];
}

export const NamedSection = ({ title, children }: Props) => {
  return (
    <>
      <h3>{title}</h3>
      {children}
    </>
  );
};
