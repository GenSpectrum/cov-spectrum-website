import { useLocation } from 'react-router-dom';
import React, { useMemo, useState } from 'react';
import { useQuery } from '../helpers/query-hook';
import {
  chatCommentMessage,
  chatRateMessage,
  chatSendMessage,
  checkAuthentication,
  createConversation,
} from '../data/chat/api-chat';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { GiPerspectiveDiceSixFacesRandom } from 'react-icons/gi';
import { GoComment, GoTriangleDown, GoTriangleUp } from 'react-icons/go';
import {
  ChatContainer,
  ConversationHeader,
  MainContainer,
  Message,
  MessageInput,
  MessageList,
  SendButton,
  TypingIndicator,
} from '@chatscope/chat-ui-kit-react';
import { FloatingLabel, Modal, Table, Form } from 'react-bootstrap';
import { getRandomChatPrompt } from '../data/chat/chat-example-prompts';
import { ChatConversation } from '../data/chat/types-chat';
import { Button, ButtonVariant } from '../helpers/ui';

export const ChatPage = () => {
  let queryParamsString = useLocation().search;
  const queryParam = useMemo(() => new URLSearchParams(queryParamsString), [queryParamsString]);

  const accessKey = queryParam.get('accessKey');
  const authenticatedQuery = useQuery(
    async signal => {
      if (!accessKey) {
        return null;
      }
      return checkAuthentication(accessKey, signal);
    },
    [accessKey]
  );

  if (!accessKey) {
    return <>This page is only for people with an access key.</>;
  }

  if (authenticatedQuery.isLoading) {
    return <>Loading...</>;
  }

  if (authenticatedQuery.isError) {
    return <>Something went wrong. Please refresh the page.</>;
  }

  if (!authenticatedQuery.data) {
    return <>The access key is wrong.</>;
  }

  return (
    <>
      <ChatMain chatAccessKey={accessKey} />
    </>
  );
};

type ChatMainProps = {
  chatAccessKey: string;
};

export const ChatMain = ({ chatAccessKey }: ChatMainProps) => {
  const [waiting, setWaiting] = useState(false);
  const [contentInMessageInput, setContentInMessageInput] = useState('');

  const [toBeLogged, setToBeLogged] = useState<boolean | undefined>();
  const [conversation, setConversation] = useState<ChatConversation | undefined>();

  const recordLoggingDecision = async (decision: boolean) => {
    if (toBeLogged !== undefined) {
      return;
    }
    setToBeLogged(decision);

    // Now, the conversation can actually start! Let's get a conversation ID.
    setConversation(await createConversation(chatAccessKey, decision));
  };

  const sendMessage = (content: string, randomlyGenerated?: boolean) => {
    if (!conversation || waiting) {
      return;
    }
    if (content.trim().length === 0) {
      return;
    }
    setContentInMessageInput('');
    setWaiting(true);
    if (conversation) {
      conversation.messages = [...conversation.messages, { role: 'user', content }];
    }
    // Adding "I have a random question. " as a prefix to allow us to identify randomly generated questions in our database.
    const contentForAI = (randomlyGenerated ? 'I have a random question. ' : '') + content;
    chatSendMessage(chatAccessKey, conversation.id, contentForAI).then(responseMessage => {
      if (!conversation) {
        return;
      }
      conversation.messages = [...conversation.messages, responseMessage];
      setWaiting(false);
    });
  };

  const rateMessage = (messageId: number, rating: 'up' | 'down') => {
    if (!conversation) {
      return;
    }
    chatRateMessage(chatAccessKey, conversation.id, messageId, rating);
  };

  const commentMessage = (messageId: number, comment: string) => {
    if (!conversation) {
      return;
    }
    chatCommentMessage(chatAccessKey, conversation.id, messageId, comment);
  };

  return (
    <>
      <div className='bg-gray-100'>
        <div
          style={{
            position: 'relative',
            maxWidth: 1000,
            marginLeft: 'auto',
            marginRight: 'auto',
            height: 'calc(100vh - 4.5em)',
          }}
        >
          <MainContainer responsive>
            <ChatContainer>
              <ConversationHeader>
                <ConversationHeader.Content
                  userName='GenSpectrum'
                  info='LLM: ChatGPT-3.5, data engine: LAPIS, data source: GISAID'
                />
              </ConversationHeader>
              <MessageList typingIndicator={waiting && <TypingIndicator content='Calculating...' />}>
                {/* Welcome and introduction message */}
                <Message
                  model={{
                    type: 'custom',
                    sentTime: '',
                    sender: 'GenSpectrum',
                    direction: 'incoming',
                    position: 'single',
                  }}
                >
                  <Message.CustomContent>
                    Hello! This is GenSpectrum chat. TODO: Basic description of the chat.
                  </Message.CustomContent>
                </Message>

                {/* Ask whether the conversation may be recorded */}
                <Message
                  model={{
                    type: 'custom',
                    sentTime: '',
                    sender: 'GenSpectrum',
                    direction: 'incoming',
                    position: 'single',
                  }}
                >
                  <Message.CustomContent>
                    <div>
                      <div>
                        We would like to record the conversation and use it for research purposes. May we
                        record?
                      </div>
                    </div>
                  </Message.CustomContent>
                </Message>
                {toBeLogged === undefined && (
                  <Message
                    model={{
                      type: 'custom',
                      sentTime: '',
                      sender: 'You',
                      direction: 'outgoing',
                      position: 'single',
                    }}
                  >
                    <Message.CustomContent>
                      <div className='flex flex-row gap-x-2'>
                        <Button variant={ButtonVariant.PRIMARY} onClick={() => recordLoggingDecision(true)}>
                          Yes
                        </Button>
                        <Button variant={ButtonVariant.PRIMARY} onClick={() => recordLoggingDecision(false)}>
                          No
                        </Button>
                      </div>
                    </Message.CustomContent>
                  </Message>
                )}
                {toBeLogged === true && (
                  <>
                    <Message
                      model={{
                        type: 'custom',
                        sentTime: '',
                        sender: 'You',
                        direction: 'outgoing',
                        position: 'single',
                      }}
                    >
                      <Message.CustomContent>Yes</Message.CustomContent>
                    </Message>
                    <Message
                      model={{
                        type: 'custom',
                        sentTime: '',
                        sender: 'GenSpectrum',
                        direction: 'incoming',
                        position: 'single',
                      }}
                    >
                      <Message.CustomContent>
                        Thank you very much for permitting the conversation to be recorded.
                      </Message.CustomContent>
                    </Message>
                  </>
                )}
                {toBeLogged === false && (
                  <>
                    <Message
                      model={{
                        type: 'custom',
                        sentTime: '',
                        sender: 'You',
                        direction: 'outgoing',
                        position: 'single',
                      }}
                    >
                      <Message.CustomContent>No</Message.CustomContent>
                    </Message>
                    <Message
                      model={{
                        type: 'custom',
                        sentTime: '',
                        sender: 'GenSpectrum',
                        direction: 'incoming',
                        position: 'single',
                      }}
                    >
                      <Message.CustomContent>
                        Okay, the conversation will not be recorded.
                      </Message.CustomContent>
                    </Message>
                  </>
                )}

                {conversation?.messages.map((message, index) =>
                  message.role === 'user' ? (
                    <Message
                      key={index}
                      model={{
                        message: message.content,
                        sentTime: '',
                        sender: 'You',
                        direction: 'outgoing',
                        position: 'single',
                      }}
                    />
                  ) : (
                    <CustomIncomingMessage
                      key={index}
                      showFeedbackButtons={toBeLogged!}
                      onRateUp={() => rateMessage(message.id!, 'up')}
                      onRateDown={() => rateMessage(message.id!, 'down')}
                      onComment={comment => commentMessage(message.id!, comment)}
                    >
                      <div>
                        <div>{message.text}</div>
                        {message.data && message.data.length && (
                          <div className='m-2 mt-4'>
                            <Table striped bordered hover>
                              <thead>
                                <tr>
                                  {Object.keys(message.data[0]).map(key => (
                                    <th key={key}>{key}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {message.data.map((row, index) => (
                                  <tr key={index}>
                                    {Object.keys(message.data![0]).map(key => (
                                      <td key={key}>{row[key]}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>
                        )}
                      </div>
                    </CustomIncomingMessage>
                  )
                )}
              </MessageList>

              <div
                /* @ts-ignore */
                as={MessageInput}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  borderTop: '1px solid #d1dbe4',
                }}
              >
                <button
                  className='cs-button'
                  style={{
                    fontSize: '1.8em',
                    marginLeft: 0,
                    paddingLeft: '0.2em',
                    paddingRight: 0,
                  }}
                  onClick={() => sendMessage(getRandomChatPrompt(), true)}
                >
                  <GiPerspectiveDiceSixFacesRandom />
                </button>
                <MessageInput
                  sendButton={false}
                  attachButton={false}
                  style={{
                    flexGrow: 1,
                    borderTop: 0,
                    flexShrink: 'initial',
                  }}
                  placeholder={`Let's chat about SARS-CoV-2 variants`}
                  disabled={!conversation || waiting}
                  onChange={(_, textContent) => setContentInMessageInput(textContent)}
                  value={contentInMessageInput}
                  onSend={(_, textContent) => sendMessage(textContent)}
                />
                <SendButton
                  style={{
                    fontSize: '1.2em',
                    marginLeft: 0,
                    paddingLeft: '0.2em',
                    paddingRight: '0.2em',
                  }}
                  onClick={() => sendMessage(contentInMessageInput)}
                />
              </div>
            </ChatContainer>
          </MainContainer>
        </div>
      </div>
    </>
  );
};

type CustomMessageProps = {
  children: React.ReactNode;
  showFeedbackButtons: boolean;
  onRateUp: () => void;
  onRateDown: () => void;
  onComment: (comment: string) => void;
};

const CustomIncomingMessage = ({
  children,
  showFeedbackButtons,
  onRateUp,
  onRateDown,
  onComment,
}: CustomMessageProps) => {
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
