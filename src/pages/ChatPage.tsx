import { useLocation } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useQuery } from '../helpers/query-hook';
import { chatSendMessage, getChatConversation, getChatUserInfo } from '../data/chat/api-chat';
import { ChatUserInfo } from '../data/chat/types-chat';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
  ChatContainer,
  Conversation,
  ConversationHeader,
  ConversationList,
  MainContainer,
  Message,
  MessageInput,
  MessageList,
  Sidebar,
  TypingIndicator,
} from '@chatscope/chat-ui-kit-react';
import { Table } from 'react-bootstrap';

export const ChatPage = () => {
  let queryParamsString = useLocation().search;
  const queryParam = useMemo(() => new URLSearchParams(queryParamsString), [queryParamsString]);

  const accessKey = queryParam.get('accessKey');
  const userInfo = useQuery(
    async signal => {
      if (!accessKey) {
        return null;
      }
      return getChatUserInfo(accessKey, signal);
    },
    [accessKey]
  );

  if (!accessKey) {
    return <>This page is only for people with an access key.</>;
  }

  if (userInfo.isLoading) {
    return <>Loading...</>;
  }

  if (!userInfo.data) {
    return <>The access key is wrong.</>;
  }

  return (
    <>
      <ChatMain chatAccessKey={accessKey} userInfo={userInfo.data} />
    </>
  );
};

type ChatMainProps = {
  chatAccessKey: string;
  userInfo: ChatUserInfo;
};

export const ChatMain = ({ chatAccessKey, userInfo }: ChatMainProps) => {
  const [activeConversation, setActiveConversation] = useState(userInfo.conversationIds[0]);
  const [waiting, setWaiting] = useState(false);

  const conversation = useQuery(
    signal => getChatConversation(chatAccessKey, activeConversation, signal),
    [activeConversation]
  );

  const sendMessage = (content: string) => {
    setWaiting(true);
    if (conversation.data) {
      conversation.data.messages = [...conversation.data.messages, { role: 'user', content }];
    }
    chatSendMessage(chatAccessKey, activeConversation, content).then(responseMessage => {
      if (!conversation.data) {
        return;
      }
      conversation.data.messages = [...conversation.data.messages, responseMessage];
      setWaiting(false);
    });
  };

  return (
    <>
      <div style={{ position: 'relative', height: '700px' }}>
        <MainContainer responsive>
          <Sidebar position='left' scrollable={false}>
            <ConversationList>
              {userInfo.conversationIds.map(id => (
                <Conversation
                  name={`Conversation ${id}`}
                  active={id === activeConversation}
                  onClick={() => {
                    if (!waiting) {
                      setActiveConversation(id);
                    }
                  }}
                  info='Model: ChatGPT-3.5'
                />
              ))}
            </ConversationList>
          </Sidebar>
          <ChatContainer>
            <ConversationHeader>
              <ConversationHeader.Back />
              <ConversationHeader.Content
                userName={`Conversation ${activeConversation}`}
                info={`Used quota: $${userInfo.quotaUsed / 100} / $${userInfo.quota / 100}`}
              />
            </ConversationHeader>
            <MessageList
              typingIndicator={waiting && <TypingIndicator content='Calculating...' />}
              loading={conversation.isLoading}
            >
              {conversation.data?.messages.map(message =>
                message.role === 'user' ? (
                  <Message
                    model={{
                      message: message.content,
                      sentTime: '',
                      sender: 'You',
                      direction: 'outgoing',
                      position: 'single',
                    }}
                  />
                ) : (
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
                        <div>{message.text}</div>
                        {message.data && message.data.length && (
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
                        )}
                      </div>
                    </Message.CustomContent>
                  </Message>
                )
              )}
            </MessageList>
            <MessageInput
              placeholder='Type message here'
              disabled={waiting}
              onSend={textContent => {
                sendMessage(textContent);
              }}
            />
          </ChatContainer>
        </MainContainer>
      </div>
    </>
  );
};
