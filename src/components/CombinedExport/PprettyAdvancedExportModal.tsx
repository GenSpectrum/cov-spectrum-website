import { PprettyFileFormat, pprettyFileFormats } from '../../data/ppretty/ppretty-request';
import { Modal } from 'react-bootstrap';
import React, { useState } from 'react';
import { Button, ButtonVariant } from '../../helpers/ui';
import { Form } from 'react-bootstrap';

type Props = {
  show: boolean;
  onClose: () => void;
  onSubmit: (setting: PprettyAdvancedSetting) => void;
};

export type PprettyAdvancedSetting = {
  format: PprettyFileFormat;
  sizeMultiplier: number;
  sizeRatio: number;
};

export const PprettyAdvancedExportModal = ({ show, onClose, onSubmit }: Props) => {
  const [format, setFormat] = useState<PprettyFileFormat>('png');
  const [sizeMultiplier, setSizeMultiplier] = useState(1);
  const [sizeRatio, setSizeRatio] = useState(1);

  const handleSubmit = () => {
    onSubmit({ format, sizeMultiplier, sizeRatio });
  };

  return (
    <Modal show={show} onHide={onClose} dialogClassName='w-96'>
      <Modal.Header closeButton>
        <Modal.Title>Export plot</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className='mb-4'>
          {pprettyFileFormats.map(f => (
            <Form.Check
              key={f}
              inline
              label={f.toUpperCase()}
              name='type'
              type='radio'
              checked={f === format}
              onChange={() => setFormat(f)}
            />
          ))}
        </div>
        <Form.Group>
          <Form.Label>Size (multiplier)</Form.Label>
          <Form.Control
            type='number'
            value={sizeMultiplier}
            onChange={e => setSizeMultiplier(Number.parseFloat(e.target.value))}
            step={0.1}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Width-to-height ratio</Form.Label>
          <Form.Control
            type='number'
            value={sizeRatio}
            onChange={e => setSizeRatio(Number.parseFloat(e.target.value))}
            step={0.1}
          />
        </Form.Group>
        <Button variant={ButtonVariant.PRIMARY} onClick={handleSubmit} className='mt-4'>
          Export
        </Button>
      </Modal.Body>
    </Modal>
  );
};
