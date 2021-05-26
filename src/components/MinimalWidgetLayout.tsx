import React from 'react';

interface Props {
  title: string;
  toolbar?: React.ReactChild | React.ReactChild[];
  children: React.ReactChild | React.ReactChild[];
}

export const MinimalWidgetLayout = ({ toolbar, children }: Props) => {
  return (
    <div>
      {toolbar}
      {children}
    </div>
  );
};
