import { Modal } from 'react-bootstrap';
import React from 'react';

type Props = {
  show: boolean;
  handleClose: () => void;
  header?: string;
  children: React.ReactNode;
};

export const AlmostFullscreenModal = ({ show, handleClose, header, children }: Props) => {
  return (
    <Modal show={show} onHide={handleClose} dialogClassName='w-11/12 max-w-full'>
      {header && (
        <Modal.Header closeButton>
          <Modal.Title>{header}</Modal.Title>
        </Modal.Header>
      )}
      <Modal.Body>{children}</Modal.Body>
    </Modal>
  );
};
