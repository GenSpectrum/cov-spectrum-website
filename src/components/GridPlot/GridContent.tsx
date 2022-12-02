import React from 'react';

export interface Props {
  children: React.ReactChild | React.ReactChild[];
  label: string;
  onLabelClick: () => void;
}

export const GridContent: React.FC<Props> = () => {
  return null;
};
