import React from 'react';
import { useResizeDetector } from 'react-resize-detector';
import styled from 'styled-components';
import { GridCellRequest, PlacedGridCell, placeGridCells } from './algorithm';
import { GridCell, Props as GridCellProps } from './GridCell';

interface Props {
  children: React.ReactChild | React.ReactChild[];
}

function childIsGridCell(
  child: React.ReactChild | {}
): child is React.ReactElement<GridCellProps, typeof GridCell> {
  return typeof child === 'object' && (child as any).type === GridCell;
}

const Row = styled.div`
  display: flex;
`;

export const PackedGrid = ({ children }: Props) => {
  const childrenAsArray: (React.ReactChild | {})[] = React.Children.toArray(children);
  const gridCellChildren = childrenAsArray
    .map(c => (childIsGridCell(c) ? c : undefined))
    .filter(v => v)
    .map(v => v!);
  const nonGridCellChildren = childrenAsArray.filter(c => !childIsGridCell(c));

  if (nonGridCellChildren.length) {
    console.warn('all direct children of PackedGrid should be GridCell');
  }

  const requests: GridCellRequest[] = gridCellChildren.map(c => c.props);

  const { width, ref } = useResizeDetector<HTMLDivElement>();

  let placedGridCells: PlacedGridCell[][] = [];
  if (width) {
    try {
      placedGridCells = placeGridCells(requests, Math.floor(width));
    } catch (err) {
      console.error('placeGridCells failed', err);
      placedGridCells = requests.map((v, i) => [{ index: i, width: v.minWidth, height: v.minHeight }]);
    }
  }

  return (
    <div ref={ref}>
      {placedGridCells.map((row, i) => (
        <Row key={i}>
          {row.map(cell => {
            const child = gridCellChildren[cell.index];
            return (
              <div
                key={child.key === null ? `child-${cell.index}` : `child-around-${child.key}`}
                style={{ width: cell.width, minHeight: cell.height }}
              >
                {child.props.children}
              </div>
            );
          })}
        </Row>
      ))}
    </div>
  );
};
