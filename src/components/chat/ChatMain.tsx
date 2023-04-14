import { useFocus } from '../../helpers/use-focus';
import React, { useEffect, useState } from 'react';
import {
  ChatApiError,
  chatCommentMessage,
  chatRateMessage,
  chatSendMessage,
  createConversation,
} from '../../data/chat/api-chat';
import { ChatConversation } from '../../data/chat/types-chat';
import { useBaseLocation } from '../../helpers/use-base-location';
import { getGreeting } from '../../data/chat/chat-greetings';
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
import { GiPerspectiveDiceSixFacesRandom } from 'react-icons/gi';
import { ExternalLink } from '../ExternalLink';
import { ProgressBar, Table } from 'react-bootstrap';
import { getRandomChatPrompt } from '../../data/chat/chat-example-prompts';
import { CustomIncomingMessage } from './CustomIncomingMessage';

type ChatMainProps = {
  chatAccessKey: string;
};

export const ChatMain = ({ chatAccessKey }: ChatMainProps) => {
  const MAX_MESSAGE_LENGTH = 350;
  const [messageInputRef, setMessageInputFocus] = useFocus();
  const [waiting, setWaiting] = useState(false);
  const [apiError, setApiError] = useState<ChatApiError>();
  const [contentInMessageInput, setContentInMessageInput] = useState({
    innerHtml: '',
    textContent: '',
    innerText: '',
  });
  const [greeting, setGreeting] = useState<string | undefined>();

  const [toBeLogged, setToBeLogged] = useState<boolean | undefined>();
  const [conversation, setConversation] = useState<ChatConversation | undefined>();

  const messageInputDisabled = !conversation || waiting || !!apiError;

  const baseLocation = useBaseLocation();
  useEffect(() => {
    if (baseLocation) {
      setGreeting(getGreeting(baseLocation));
    }
  }, [baseLocation]);

  useEffect(() => {
    if (!messageInputDisabled) {
      setMessageInputFocus();
    }
  }, [setMessageInputFocus, messageInputDisabled]);

  const recordLoggingDecision = async (decision: boolean) => {
    if (toBeLogged !== undefined) {
      return;
    }
    setToBeLogged(decision);

    // Now, the conversation can actually start! Let's get a conversation ID.
    setConversation(await createConversation(chatAccessKey, decision));
  };

  const sendMessage = async (content: string, randomlyGenerated?: boolean) => {
    if (!conversation || waiting || apiError) {
      return;
    }
    if (content.trim().length === 0) {
      return;
    }
    setContentInMessageInput({ innerHtml: '', textContent: '', innerText: '' });
    setWaiting(true);
    if (conversation) {
      conversation.messages = [...conversation.messages, { role: 'user', content }];
    }
    // Adding a prefix to allow us to identify randomly generated questions in our database.
    const contentForAI = (randomlyGenerated ? 'Here is my question foor you: ' : '') + content;
    try {
      const responseMessage = await chatSendMessage(chatAccessKey, conversation.id, contentForAI);
      conversation.messages = [...conversation.messages, responseMessage];
    } catch (e) {
      if (e instanceof ChatApiError) {
        setApiError(e);
      } else {
        throw e;
      }
    } finally {
      setWaiting(false);
    }
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

  const messageLengthProportionUsed = contentInMessageInput.textContent.length / MAX_MESSAGE_LENGTH;
  let messageLengthBarVariant: 'success' | 'warning' | 'danger' = 'success';
  if (messageLengthProportionUsed >= 0.75) {
    messageLengthBarVariant = 'danger';
  } else if (messageLengthProportionUsed >= 0.5) {
    messageLengthBarVariant = 'warning';
  }

  if (!greeting) {
    return <></>;
  }

  return (
    <>
      <div className='bg-gray-100'>
        <div
          style={{
            position: 'relative',
            maxWidth: 1000,
            marginLeft: 'auto',
            marginRight: 'auto',
            height: 'calc(100vh - 4.8em)',
          }}
        >
          <MainContainer responsive>
            <ChatContainer>
              <ConversationHeader>
                <ConversationHeader.Content
                  userName='GenSpectrum Chat'
                  info='LLM: ChatGPT-3.5, data engine: LAPIS, data source: GISAID'
                />
              </ConversationHeader>
              <MessageList typingIndicator={waiting && <TypingIndicator content='Calculating...' />}>
                {/* Welcome and introduction messages */}
                <Message
                  model={{
                    message: greeting,
                    sender: 'GenSpectrum',
                    direction: 'incoming',
                    position: 'single',
                  }}
                />
                <Message
                  model={{
                    type: 'custom',
                    sender: 'GenSpectrum',
                    direction: 'incoming',
                    position: 'single',
                  }}
                >
                  <Message.CustomContent>
                    <p>
                      Welcome at our OpenAI GPT-3.5-based chat! Here, you can ask about SARS-CoV-2 variants
                      and we will query our database for you. The chat is intended to only answer data-related
                      questions. You can click on the{' '}
                      <GiPerspectiveDiceSixFacesRandom className='inline text-[#007ee0] w-6 h-6' /> in the
                      bottom-left corner to ask a random question.
                    </p>
                    <p>
                      Please note that your messages will be sent to OpenAI. Do not share any sensitive
                      information in this chat.
                    </p>
                    <p>
                      This is a <b>very early release</b> of the chat bot, it has not yet been extensively
                      evaluated. Please <b>do not</b> rely on the answers for any decision. Check the main
                      dashboard at{' '}
                      <ExternalLink url='https://cov-spectrum.org'>cov-spectrum.org</ExternalLink> for
                      reliable information.
                    </p>
                  </Message.CustomContent>
                </Message>

                {/* Ask whether the conversation may be recorded */}
                <Message
                  model={{
                    type: 'custom',
                    sender: 'GenSpectrum',
                    direction: 'incoming',
                    position: 'single',
                  }}
                >
                  <Message.CustomContent>
                    <p>
                      To improve and evaluate the application, we would like to record the conversation. It is
                      highly valuable to see how different people phrase the questions and what people are
                      interested in knowing. (By the way, feel free to ask questions in other languages!)
                    </p>
                    <p>We would like to ask you for permission to</p>
                    <ul className='list-disc ml-8'>
                      <li>
                        store and evaluate the messages that you write and the answers that our chat bot
                        generates
                      </li>
                      <li>store and evaluate your feedback to the messages if you rate them</li>
                      <li>share the data publicly</li>
                    </ul>
                    <p>
                      We do <b>not</b> collect personal information. This includes that we will <b>not</b>{' '}
                      link the conversations with your IP address.
                    </p>
                    <p>
                      <b>May we record this conversation?</b>
                    </p>
                  </Message.CustomContent>
                </Message>
                {toBeLogged === undefined && (
                  <Message
                    model={{
                      type: 'custom',
                      sender: 'You',
                      direction: 'outgoing',
                      position: 'single',
                    }}
                  >
                    <Message.CustomContent>
                      <div className='flex flex-row gap-x-4 px-2'>
                        <button
                          className='underline underline-offset-2 decoration-2 hover:decoration-[#F18805] font-bold'
                          onClick={() => recordLoggingDecision(true)}
                        >
                          Yes
                        </button>
                        <button
                          className='underline underline-offset-2 decoration-2 hover:decoration-[#F18805] font-bold'
                          onClick={() => recordLoggingDecision(false)}
                        >
                          No
                        </button>
                      </div>
                    </Message.CustomContent>
                  </Message>
                )}
                {toBeLogged === true && (
                  <>
                    <Message
                      model={{
                        type: 'custom',
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
                        sender: 'GenSpectrum',
                        direction: 'incoming',
                        position: 'single',
                      }}
                    >
                      <Message.CustomContent>
                        Thank you very much for your consent to record the conversation!
                      </Message.CustomContent>
                    </Message>
                  </>
                )}
                {toBeLogged === false && (
                  <>
                    <Message
                      model={{
                        type: 'custom',
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
                {toBeLogged !== undefined && (
                  <Message
                    model={{
                      type: 'custom',
                      sender: 'GenSpectrum',
                      direction: 'incoming',
                      position: 'single',
                    }}
                  >
                    <Message.CustomContent>
                      <p>
                        Enjoy the chat! Any feedback and ideas are highly appreciated. Please visit our{' '}
                        <ExternalLink url='https://github.com/orgs/GenSpectrum/discussions'>
                          <b>GitHub Discussions</b>
                        </ExternalLink>{' '}
                        page and share your thoughts!
                      </p>
                    </Message.CustomContent>
                  </Message>
                )}

                {conversation?.messages.map((message, index) =>
                  message.role === 'user' ? (
                    <Message
                      key={index}
                      model={{
                        message: message.content,
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
                        <p>{message.textBeforeData}</p>
                        {message.data && message.data.length && (
                          <div className='m-2 mt-4 max-h-[300px] overflow-auto'>
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
                        {message.textAfterData && <p>{message.textAfterData}</p>}
                      </div>
                    </CustomIncomingMessage>
                  )
                )}
                {apiError && (
                  <Message
                    model={{
                      message:
                        apiError.errorType === 'CONVERSATION_IS_GONE'
                          ? 'The conversation is stale. Please refresh the page.'
                          : 'An unexpected error occurred. Please refresh the page. If the happens more often, please let us know on GitHub.',
                      sender: 'GenSpectrum',
                      direction: 'incoming',
                      position: 'single',
                    }}
                  />
                )}
              </MessageList>

              <div
                /* @ts-ignore */
                as={MessageInput}
                // The margin is to avoid the message input bar to be hidden on mobile if one does not scroll down.
                className='mb-14'
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  borderTop: '1px solid #d1dbe4',
                  borderBottom: '1px solid #d1dbe4',
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
                  ref={messageInputRef}
                  sendButton={false}
                  attachButton={false}
                  style={{
                    flexGrow: 1,
                    borderTop: 0,
                    flexShrink: 'initial',
                  }}
                  placeholder={`Let's chat about variants`}
                  disabled={messageInputDisabled}
                  onChange={(innerHtml, textContent, innerText) => {
                    if (textContent.length <= MAX_MESSAGE_LENGTH) {
                      setContentInMessageInput({ innerHtml, textContent, innerText });
                    }
                  }}
                  value={contentInMessageInput.innerHtml}
                  onSend={(_, textContent) => sendMessage(textContent)}
                />
                <div className='px-1 flex flex-column'>
                  <SendButton
                    style={{
                      fontSize: '1.2em',
                    }}
                    onClick={() => sendMessage(contentInMessageInput.innerText)}
                  />
                  <ProgressBar
                    striped
                    variant={messageLengthBarVariant}
                    now={contentInMessageInput.textContent.length}
                    max={MAX_MESSAGE_LENGTH}
                    className='mb-2 h-1.5'
                  />
                </div>
              </div>
            </ChatContainer>
          </MainContainer>
        </div>
      </div>
    </>
  );
};
