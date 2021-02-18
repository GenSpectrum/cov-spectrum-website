import { Button, Modal, Form, ButtonToolbar } from 'react-bootstrap';
import { useState } from 'react';

const host = process.env.REACT_APP_WEBSITE_HOST;

// InternalProps are passed by Widget
export interface InternalProps {
  shareUrl: string;
  children: React.ReactChild | React.ReactChild[];
}

// ExternalProps are passed by users of Widget.ShareableComponent
export interface ExternalProps {
  toolbarChildren?: React.ReactChild | React.ReactChild[];
}
const externalPropsKeys: (keyof ExternalProps)[] = ['toolbarChildren'];

export function pickExternalProps<T extends { [K in keyof ExternalProps]?: never }>(
  allProps: T
): { external: Partial<ExternalProps>; remaining: T } {
  const external: { [key: string]: unknown } = {};
  const remaining: { [key: string]: unknown } = {};
  for (const [k, v] of Object.entries(allProps)) {
    if ((externalPropsKeys as string[]).includes(k)) {
      external[k] = v;
    } else {
      remaining[k] = v;
    }
  }
  return { external, remaining: remaining as any };
}

type Props = InternalProps & ExternalProps;

export function WidgetWrapper({ shareUrl, children, toolbarChildren }: Props) {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const embeddingCode = `<iframe src="${host}/embed/${shareUrl}" width="800" height="500" frameborder="0"></iframe>`;

  return (
    <>
      <div style={{ position: 'relative' }}>
        <ButtonToolbar>
          <Button variant='outline-primary' size='sm' onClick={handleShow}>
            Share
          </Button>
          {toolbarChildren}
        </ButtonToolbar>
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
    </>
  );
}
