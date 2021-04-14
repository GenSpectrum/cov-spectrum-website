import React, { useRef } from 'react';
import { createHtmlPortalNode, HtmlPortalNode, InPortal, OutPortal } from 'react-reverse-portal';
import { useResizeDetector } from 'react-resize-detector';
import styled from 'styled-components';
import { GridCellRequest, PlacedGridCell, placeGridCells } from './algorithm';
import { GridCell, Props as GridCellProps } from './GridCell';

interface Props {
  children: React.ReactNode;
  maxColumns?: number;
}

function childIsGridCell(
  child: React.ReactChild | {}
): child is React.ReactElement<GridCellProps, typeof GridCell> {
  return typeof child === 'object' && (child as any).type === GridCell;
}

const Row = styled.div`
  display: flex;
  align-items: stretch;
`;

export const PackedGrid = ({ children, maxColumns }: Props) => {
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
      placedGridCells = placeGridCells(requests, { maxColumns, parentWidth: Math.floor(width) });
    } catch (err) {
      console.error('placeGridCells failed', err);
      placedGridCells = requests.map((v, i) => [{ index: i, width }]);
    }
  }

  const lastPortalNodesByKey = useRef(new Map<unknown, HtmlPortalNode>());
  const portalNodes = gridCellChildren.map(c => {
    if (!lastPortalNodesByKey.current.has(c.key)) {
      lastPortalNodesByKey.current.set(c.key, createHtmlPortalNode());
    }
    return lastPortalNodesByKey.current.get(c.key)!;
  });

  return (
    <div ref={ref}>
      {placedGridCells.map((row, i) => (
        <Row key={i}>
          {row.map((cell, j) => (
            <OutPortal key={j} node={portalNodes[cell.index]} />
          ))}
        </Row>
      ))}
      {placedGridCells.flatMap(row =>
        row.map(cell => {
          const child = gridCellChildren[cell.index];
          return (
            <InPortal
              key={child.key === null ? `child-${cell.index}` : `child-around-${child.key}`}
              node={portalNodes[cell.index]}
            >
              <div style={{ width: cell.width, overflow: 'hidden' }}>{child.props.children}</div>
            </InPortal>
          );
        })
      )}
    </div>
  );
};
