import { Button, Modal, Form } from 'react-bootstrap';
import { useState } from 'react';
import styled from 'styled-components';

const host = process.env.REACT_APP_WEBSITE_HOST;
const HEIGHT = 500;

const Wrapper = styled.div`
  height: ${HEIGHT}px;
`;

interface Props {
  shareUrl?: string;
  children: React.ReactChild | React.ReactChild[];
  isLoading?: boolean;
}

export function WidgetWrapper({ shareUrl, children, isLoading = false }: Props) {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const embeddingCode =
    shareUrl &&
    `<iframe src="${host}/embed/${shareUrl}" width="800" height="${HEIGHT}" frameborder="0"></iframe>`;

  return (
    <Wrapper>
      <div style={{ position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            zIndex: 500,
            left: '10px',
            top: '10px',
          }}
        >
          {!isLoading && embeddingCode && (
            <Button variant='outline-primary' size='sm' onClick={handleShow}>
              Share
            </Button>
          )}
        </div>
        {children}
      </div>

      <Modal size='lg' show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Embed widget on your website</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Copy the following code into your website to embed the widget.</p>
          <Form.Control as='textarea' value={embeddingCode} rows={7} readOnly />
        </Modal.Body>
      </Modal>
    </Wrapper>
  );
}
