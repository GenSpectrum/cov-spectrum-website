import React from 'react';
import { GridCellRequest } from './algorithm';

export interface Props extends GridCellRequest {
  children: React.ReactChild | React.ReactChild[];
}

export const GridCell: React.FC<Props> = () => {
  return null;
};
