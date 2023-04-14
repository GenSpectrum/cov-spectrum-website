import React, { useState } from 'react';
import { Message } from '@chatscope/chat-ui-kit-react';
import { GoComment, GoTriangleDown, GoTriangleUp } from 'react-icons/go';
import { FloatingLabel, Form, Modal } from 'react-bootstrap';
import { Button, ButtonVariant } from '../../helpers/ui';

export type CustomIncomingMessageProps = {
  children: React.ReactNode;
  showFeedbackButtons: boolean;
  onRateUp: () => void;
  onRateDown: () => void;
  onComment: (comment: string) => void;
};

export const CustomIncomingMessage = ({
  children,
  showFeedbackButtons,
  onRateUp,
  onRateDown,
  onComment,
}: CustomIncomingMessageProps) => {
  const [ratedUp, setRatedUp] = useState(false);
  const [ratedDown, setRatedDown] = useState(false);
  const [commented, setCommented] = useState(false);
  const [commentFieldOpen, setCommentFieldOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const rated = ratedUp || ratedDown;
  const colorClicked = '#F18805';
  const colorDefault = 'black';

  const submitComment = (comment: string) => {
    onComment(comment);
    setCommented(true);
    setCommentFieldOpen(false);
  };

  return (
    <>
      {/* Main */}
      <section
        /* @ts-ignore */
        as={Message}
        aria-label='GenSpectrum'
        className={`cs-message cs-message--incoming cs-message--single"`}
      >
        <div className='cs-message__content-wrapper'>
          <div className='cs-message__content min-h-[4em]'>
            <div className='cs-message__custom-content'>{children}</div>
          </div>
        </div>
        {showFeedbackButtons && (
          <div className='mt-2 ml-2 flex flex-col'>
            <button
              onClick={() => {
                onRateUp();
                setRatedUp(true);
              }}
              disabled={rated}
            >
              <GoTriangleUp className='h-4 w-4' style={{ color: ratedUp ? colorClicked : colorDefault }} />
            </button>
            <button onClick={() => setCommentFieldOpen(true)} disabled={commented}>
              <GoComment className='h-4 w-4' style={{ color: commented ? colorClicked : colorDefault }} />
            </button>
            <button
              onClick={() => {
                onRateDown();
                setRatedDown(true);
              }}
              disabled={rated}
            >
              <GoTriangleDown
                className='h-4 w-4'
                style={{ color: ratedDown ? colorClicked : colorDefault }}
              />
            </button>
          </div>
        )}
      </section>

      {/* Comment modal */}
      <Modal show={commentFieldOpen} onHide={() => setCommentFieldOpen(false)}>
        <Modal.Body>
          <div className='flex flex-column h-48'>
            <FloatingLabel label='Comments' className='flex-1'>
              <Form.Control
                as='textarea'
                placeholder='Comments'
                onChange={e => setCommentText(e.target.value)}
                className='h-full'
                value={commentText}
              />
            </FloatingLabel>
            <Button
              variant={ButtonVariant.PRIMARY}
              onClick={() => submitComment(commentText)}
              className='px-4 pt-4'
            >
              Submit
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};
