import { useLocation } from 'react-router-dom';
import React, { useMemo } from 'react';
import { useQuery } from '../helpers/query-hook';
import { checkAuthentication } from '../data/chat/api-chat';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { ChatMain } from '../components/chat/ChatMain';

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
