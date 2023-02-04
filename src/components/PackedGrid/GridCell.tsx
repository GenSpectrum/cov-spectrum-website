import React from 'react';
import { GridCellRequest } from './algorithm';

export interface Props extends GridCellRequest {
  children: React.ReactNode | React.ReactNode[];
}

export const GridCell: React.FC<Props> = () => {
  return null;
};
