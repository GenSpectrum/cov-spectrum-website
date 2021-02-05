import { Button, Modal, Form } from 'react-bootstrap'
import { useState } from 'react'

const host = process.env.REACT_APP_WEBSITE_HOST

export function WidgetWrapper({ shareUrl, children }) {
  const [show, setShow] = useState(false)
  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  const embeddingCode = `<iframe src="${host}/embed/${shareUrl}" width="800" height="500" frameborder="0"></iframe>`

  return (
    <>
      <div style={{ position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            zIndex: 500,
            left: '10px',
            top: '10px',
          }}
        >
          <Button variant='outline-primary' size='sm' onClick={handleShow}>
            Share
          </Button>
        </div>
        {children}
      </div>

      <Modal size='lg' show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Embed widget on your website</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Copy the following code into your website to embed the widget.</p>
          <Form.Control as='textarea' value={embeddingCode} rows={7} />
        </Modal.Body>
      </Modal>
    </>
  )
}
