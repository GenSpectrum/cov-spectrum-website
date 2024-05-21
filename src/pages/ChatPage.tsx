import { useLocation } from 'react-router-dom';
import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '../helpers/query-hook';
import { checkAuthentication } from '../data/chat/api-chat';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { ChatMain } from '../components/chat/ChatMain';
import {
  ChatContainer,
  ConversationHeader,
  MainContainer,
  Message,
  MessageInput,
  MessageList,
} from '@chatscope/chat-ui-kit-react';
import { IncomingPlainMessage } from '../components/chat/IncomingPlainMessage';
import { CustomMessageInput } from '../components/chat/CustomMessageInput';
import { useBaseLocation } from '../helpers/use-base-location';
import { getGreeting } from '../data/chat/chat-greetings';

export const ChatPage = () => {
  let queryParamsString = useLocation().search;
  const queryParam = useMemo(() => new URLSearchParams(queryParamsString), [queryParamsString]);

  const accessKey = queryParam.get('accessKey') ?? 'ck-4loejpUR3Fx0aQurGpYeSu4iKUS';
  const authenticatedQuery = useQuery(
    async signal => {
      return checkAuthentication(accessKey, signal);
    },
    [accessKey]
  );

  if (!accessKey) {
    return (
      <>The chat is currently in a private testing phase and only accessible to people with an access key.</>
    );
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

  return <ChatMain chatAccessKey={accessKey} />;
};

export const DisabledChatPage = () => {
  const [greeting, setGreeting] = useState<string | undefined>();

  const baseLocation = useBaseLocation();
  useEffect(() => {
    if (baseLocation) {
      setGreeting(getGreeting(baseLocation));
    }
  }, [baseLocation]);

  if (!greeting) {
    return <></>;
  }

  return (
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
              <ConversationHeader.Content userName='GenSpectrum Chat' info={`Not available`} />
            </ConversationHeader>
            <MessageList>
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
                  The chat is currently disabled. We are working on improving it and will make it available in
                  the future. You can find more information about the chatbot in{' '}
                  <a className='underline' href='https://arxiv.org/abs/2305.13821'>
                    our preprint
                  </a>
                  .
                </p>
              </IncomingPlainMessage>
            </MessageList>
            <CustomMessageInput
              /* @ts-ignore */
              as={MessageInput}
              disabled={true}
            />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
};
