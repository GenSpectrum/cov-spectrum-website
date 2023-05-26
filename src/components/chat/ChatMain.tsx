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
  TypingIndicator,
} from '@chatscope/chat-ui-kit-react';
import { GiPerspectiveDiceSixFacesRandom } from 'react-icons/gi';
import { CgArrowUpR, CgArrowDownR } from 'react-icons/cg';
import { ExternalLink } from '../ExternalLink';
import { IncomingPlainMessage } from './IncomingPlainMessage';
import { OutgoingPlainMessage } from './OutgoingPlainMessage';
import { IncomingResponseMessage } from './IncomingResponseMessage';
import { CustomMessageInput } from './CustomMessageInput';
import { sequenceDataSource } from '../../helpers/sequence-data-source';
import { speak } from '../../helpers/speech-synthesis';

type ChatMainProps = {
  chatAccessKey: string;
};

export const ChatMain = ({ chatAccessKey }: ChatMainProps) => {
  const [waiting, setWaiting] = useState(false);
  const [apiError, setApiError] = useState<ChatApiError>();
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

  const recordLoggingDecision = async (decision: boolean) => {
    if (toBeLogged !== undefined) {
      return;
    }
    setToBeLogged(decision);

    // Now, the conversation can actually start! Let's get a conversation ID.
    setConversation(await createConversation(chatAccessKey, decision, sequenceDataSource));
  };

  const sendMessage = async (content: string, randomlyGenerated?: boolean) => {
    if (!conversation || waiting || apiError) {
      return;
    }
    if (content.trim().length === 0) {
      return;
    }
    setWaiting(true);
    if (conversation) {
      conversation.messages = [...conversation.messages, { role: 'user', content }];
    }
    // Adding a prefix to allow us to identify randomly generated questions in our database.
    const contentForAI = (randomlyGenerated ? 'Here is my question foor you: ' : '') + content;
    try {
      const responseMessage = await chatSendMessage(chatAccessKey, conversation.id, contentForAI);
      conversation.messages = [...conversation.messages, responseMessage];
      speak(responseMessage.textBeforeData + ' ... ' + responseMessage.textAfterData);
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
                  info={`LLM: GPT-4, data engine: LAPIS, data source: ${sequenceDataSource.toUpperCase()}`}
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
                <IncomingPlainMessage>
                  <p>
                    Welcome at our OpenAI GPT-4-based chat! Here, you can ask about SARS-CoV-2 variants and we
                    will query our database for you. The chat is intended to only answer data-related
                    questions. You can click on the{' '}
                    <GiPerspectiveDiceSixFacesRandom className='inline text-[#007ee0] w-6 h-6' /> in the
                    bottom-left corner to ask a random question. The chat bot does not have a memory, yet;
                    each question is independent. You can use the <CgArrowUpR className='inline w-6 h-6' />{' '}
                    and <CgArrowDownR className='inline w-6 h-6' /> buttons on your keyboard to load and edit
                    the previous messages (like in a terminal).
                  </p>
                  <p>
                    Please note that your messages will be sent to OpenAI. Do not share any sensitive
                    information in this chat.
                  </p>
                  <p>
                    This is a <b>very early release</b> of the chat bot, it has not yet been extensively
                    evaluated. Please <b>do not</b> rely on the answers for any decision. Check the main
                    dashboard at <ExternalLink url='https://cov-spectrum.org'>cov-spectrum.org</ExternalLink>{' '}
                    for reliable information.
                  </p>
                </IncomingPlainMessage>

                {/* Ask whether the conversation may be recorded */}
                <IncomingPlainMessage>
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
                    We do <b>not</b> collect personal information. This includes that we will <b>not</b> link
                    the conversations with your IP address.
                  </p>
                  <p>
                    <b>May we record this conversation?</b>
                  </p>
                </IncomingPlainMessage>
                {toBeLogged === undefined && (
                  <OutgoingPlainMessage>
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
                  </OutgoingPlainMessage>
                )}
                {toBeLogged === true && (
                  <>
                    <OutgoingPlainMessage>Yes</OutgoingPlainMessage>
                    <IncomingPlainMessage>
                      Thank you very much for your consent to record the conversation!
                    </IncomingPlainMessage>
                  </>
                )}
                {toBeLogged === false && (
                  <>
                    <OutgoingPlainMessage>No</OutgoingPlainMessage>
                    <IncomingPlainMessage>Okay, the conversation will not be recorded.</IncomingPlainMessage>
                  </>
                )}
                {toBeLogged !== undefined && (
                  <IncomingPlainMessage>
                    <p>
                      Enjoy the chat! Any feedback and ideas are highly appreciated. Please visit our{' '}
                      <ExternalLink url='https://github.com/orgs/GenSpectrum/discussions'>
                        <b>GitHub Discussions</b>
                      </ExternalLink>{' '}
                      page and share your thoughts!
                    </p>
                  </IncomingPlainMessage>
                )}

                {/* The actual conversation */}
                {conversation?.messages.map((message, index) =>
                  message.role === 'user' ? (
                    <OutgoingPlainMessage key={index}>{message.content}</OutgoingPlainMessage>
                  ) : (
                    <IncomingResponseMessage
                      key={index}
                      message={message}
                      toBeLogged={toBeLogged!}
                      onRateUp={() => rateMessage(message.id!, 'up')}
                      onRateDown={() => rateMessage(message.id!, 'down')}
                      onComment={comment => commentMessage(message.id!, comment)}
                    />
                  )
                )}
                {apiError && (
                  <IncomingPlainMessage>
                    {apiError.errorType === 'CONVERSATION_IS_GONE'
                      ? 'The conversation is stale. Please refresh the page.'
                      : 'An unexpected error occurred. Please refresh the page. If the happens more often, please let us know on GitHub.'}
                  </IncomingPlainMessage>
                )}
              </MessageList>

              <CustomMessageInput
                /* @ts-ignore */
                as={MessageInput}
                disabled={messageInputDisabled}
                maxLength={350}
                onMessageSend={sendMessage}
              />
            </ChatContainer>
          </MainContainer>
        </div>
      </div>
    </>
  );
};
