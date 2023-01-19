import React from 'react';

interface Props {
  title: string;
  toolbar?: React.ReactNode | React.ReactNode[];
  children: React.ReactNode | React.ReactNode[];
}

export const MinimalWidgetLayout = ({ toolbar, children }: Props) => {
  return (
    <div>
      {toolbar}
      {children}
    </div>
  );
};
