import { Form, Modal } from 'react-bootstrap';
import React, { useEffect, useRef, useState } from 'react';

type Props = {
  pangoLineage: string;
  setPangoLineage: (pangoLineage: string) => void;
};

const NewFocusPageCommandPanel = ({ pangoLineage, setPangoLineage }: Props) => {
  const [pangoLineageField, setPangoLineageField] = useState(pangoLineage);
  const ref = useRef<any>(null);

  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);

  useEffect(() => {
    setPangoLineageField(pangoLineage);
  }, [pangoLineage, setPangoLineageField]);

  return (
    <>
      <Form
        onSubmit={e => {
          e.preventDefault();
          setPangoLineage(pangoLineageField);
        }}
      >
        <Form.Control
          ref={ref}
          type='text'
          value={pangoLineageField}
          onChange={e => setPangoLineageField(e.target.value)}
        />
      </Form>
    </>
  );
};

type ModalProps = {
  show: boolean;
  handleClose: () => void;
};

export const NewFocusPageCommandPanelModal = ({ show, handleClose, ...panelProps }: Props & ModalProps) => {
  return (
    <Modal show={show} onHide={handleClose} size='lg'>
      <Modal.Header closeButton>
        <Modal.Title>Search variant (CTRL+K or CMD+K)</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <NewFocusPageCommandPanel {...panelProps} />
      </Modal.Body>
    </Modal>
  );
};
