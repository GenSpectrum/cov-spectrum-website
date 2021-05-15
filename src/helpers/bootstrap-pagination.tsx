import { Pagination } from 'react-bootstrap';
import React from 'react';

export type BootstrapPaginationControl = {
  elements: JSX.Element[];
};

type OnPageClickFunction = {
  (page: number): void;
};

function createItem(number: number, active: boolean, onPageClick: OnPageClickFunction) {
  return (
    <Pagination.Item key={number} active={active} onClick={() => onPageClick(number)}>
      {number}
    </Pagination.Item>
  );
}

/**
 * The page numbers start with 1.
 */
export function createBootstrapPaginationControl(
  totalElements: number,
  elementsPerPage: number,
  activePage: number,
  onPageClick: OnPageClickFunction
): BootstrapPaginationControl {
  const numberPages = Math.ceil(totalElements / elementsPerPage);
  let elements = [
    <Pagination.First key='first' onClick={() => onPageClick(1)} />,
    <Pagination.Prev key='previous' onClick={() => onPageClick(activePage - 1)} />,
  ];
  if (numberPages < 7) {
    for (let i = 1; i <= numberPages; i++) {
      elements.push(createItem(i, i === activePage, onPageClick));
    }
  } else {
    if (activePage !== 1) {
      elements.push(createItem(1, false, onPageClick));
    }
    if (activePage > 3) {
      elements.push(<Pagination.Ellipsis key='ellipsis-1' />);
    }
    if (activePage > 2) {
      elements.push(createItem(activePage - 1, false, onPageClick));
    }
    elements.push(createItem(activePage, true, onPageClick));
    if (activePage < numberPages - 1) {
      elements.push(createItem(activePage + 1, false, onPageClick));
    }
    if (activePage < numberPages - 2) {
      elements.push(<Pagination.Ellipsis key='ellipsis-2' />);
    }
    if (activePage !== numberPages) {
      elements.push(createItem(numberPages, false, onPageClick));
    }
  }

  elements.push(<Pagination.Next key='next' onClick={() => onPageClick(activePage + 1)} />);
  elements.push(<Pagination.Last key='last' onClick={() => onPageClick(numberPages)} />);
  return {
    elements,
  };
}
