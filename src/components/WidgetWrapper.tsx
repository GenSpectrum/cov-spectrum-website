import { Button, Modal, Form, ButtonToolbar } from 'react-bootstrap';
import { useState } from 'react';

const host = process.env.REACT_APP_WEBSITE_HOST;

// InternalProps are passed by Widget
export interface InternalProps {
  getShareUrl: () => string;
  children: React.ReactChild | React.ReactChild[];
}

// ExternalProps are passed by users of Widget.ShareableComponent
export interface ExternalProps {
  toolbarChildren?: React.ReactChild | React.ReactChild[];
  height: number;
}
const externalPropsKeys: (keyof ExternalProps)[] = ['toolbarChildren', 'height'];

export function pickExternalProps<T extends { [K in keyof ExternalProps]?: never }>(
  allProps: T
): { external: ExternalProps; remaining: T } {
  const external: { [key: string]: unknown } = {};
  const remaining: { [key: string]: unknown } = {};
  for (const [k, v] of Object.entries(allProps)) {
    if ((externalPropsKeys as string[]).includes(k)) {
      external[k] = v;
    } else {
      remaining[k] = v;
    }
  }
  return { external: (external as any) as ExternalProps, remaining: remaining as any };
}

type Props = InternalProps & ExternalProps;

export function WidgetWrapper({ getShareUrl, children, toolbarChildren, height }: Props) {
  const [shownEmbeddingCode, setShownEmbeddingCode] = useState<string>();

  const onShareClick = () => {
    const embeddingCode = `<iframe src="${host}/embed/${getShareUrl()}" width="800" height="500" frameborder="0"></iframe>`;
    setShownEmbeddingCode(embeddingCode);
  };

  return (
    <>
      <div style={{ position: 'relative' }}>
        <ButtonToolbar className='mb-1'>
          <Button variant='outline-primary' size='sm' onClick={onShareClick}>
            Share
          </Button>
          {toolbarChildren}
        </ButtonToolbar>
        <div style={{ height }}>{children}</div>
      </div>

      <Modal size='lg' show={!!shownEmbeddingCode} onHide={() => setShownEmbeddingCode(undefined)}>
        <Modal.Header closeButton>
          <Modal.Title>Embed widget on your website</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Copy the following code into your website to embed the widget.</p>
          <Form.Control as='textarea' value={shownEmbeddingCode} rows={7} readOnly />
        </Modal.Body>
      </Modal>
    </>
  );
}
