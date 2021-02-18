import { Modal, Form } from 'react-bootstrap';
import React, { useMemo, useState } from 'react';
import styled from 'styled-components';

const host = process.env.REACT_APP_WEBSITE_HOST;
const HEIGHT = 500;

const Wrapper = styled.div`
  height: ${HEIGHT}px;
`;

interface Props {
  shareUrl: string;
  children: React.ReactChild | React.ReactChild[];
}

interface ShareButtonContextValue {
  onShare?: () => void;
}

export const ShareButtonContext = React.createContext<ShareButtonContextValue>({});

export function WidgetWrapper({ shareUrl, children }: Props) {
  const [show, setShow] = useState(false);

  const shareButtonContextValue = useMemo(() => ({ onShare: () => setShow(true) }), [setShow]);

  const embeddingCode = `<iframe src="${host}/embed/${shareUrl}" width="800" height="${HEIGHT}" frameborder="0"></iframe>`;

  return (
    <Wrapper>
      <ShareButtonContext.Provider value={shareButtonContextValue}>{children}</ShareButtonContext.Provider>

      <Modal size='lg' show={show} onHide={() => setShow(false)}>
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
