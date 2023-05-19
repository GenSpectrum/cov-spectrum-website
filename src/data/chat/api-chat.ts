import { get, post, HOST } from '../api';
import { ChatConversation, ChatSystemMessage } from './types-chat';
import { SequenceDataSource } from '../../helpers/sequence-data-source';

export async function checkAuthentication(accessKey: string, signal?: AbortSignal): Promise<boolean> {
  const params = new URLSearchParams();
  params.set('accessKey', accessKey);
  const res = await get(`/chat/authenticate?${params.toString()}`, signal);
  handleCommonErrors(res.status);
  return (await res.json()).success;
}

export async function createConversation(
  accessKey: string,
  toBeLogged: boolean,
  dataSource: SequenceDataSource,
  signal?: AbortSignal
): Promise<ChatConversation> {
  const params = new URLSearchParams();
  params.set('accessKey', accessKey);
  params.set('toBeLogged', toBeLogged.toString());
  params.set('dataSource', dataSource);
  const res = await post(`/chat/createConversation?${params.toString()}`, undefined, signal);
  handleCommonErrors(res.status);
  const id = await res.text();
  return {
    id,
    messages: [],
  };
}

export async function chatSendMessage(
  accessKey: string,
  conversationId: string,
  content: string,
  signal?: AbortSignal
): Promise<ChatSystemMessage> {
  const params = new URLSearchParams();
  params.set('accessKey', accessKey);
  const res = await fetch(`${HOST}/chat/conversation/${conversationId}/sendMessage?${params.toString()}`, {
    method: 'POST',
    body: content,
    signal,
  });
  handleCommonErrors(res.status);
  return (await res.json()) as ChatSystemMessage;
}

export async function chatRateMessage(
  accessKey: string,
  conversationId: string,
  messageId: number,
  rating: 'up' | 'down',
  signal?: AbortSignal
) {
  const params = new URLSearchParams();
  params.set('accessKey', accessKey);
  const endpoint = rating === 'up' ? 'rateUp' : 'rateDown';
  const res = await post(
    `/chat/conversation/${conversationId}/message/${messageId}/${endpoint}?${params.toString()}`,
    undefined,
    signal
  );
  handleCommonErrors(res.status);
}

export async function chatCommentMessage(
  accessKey: string,
  conversationId: string,
  messageId: number,
  comment: string,
  signal?: AbortSignal
) {
  const params = new URLSearchParams();
  params.set('accessKey', accessKey);
  const res = await fetch(
    `${HOST}/chat/conversation/${conversationId}/message/${messageId}/comment?${params.toString()}`,
    {
      method: 'POST',
      body: comment,
      signal,
    }
  );
  handleCommonErrors(res.status);
}

export type ChatApiErrorType = 'CONVERSATION_IS_GONE' | 'UNKNOWN';

export class ChatApiError extends Error {
  errorType: ChatApiErrorType;

  constructor(errorType: ChatApiErrorType) {
    super(`Chat API request failed: ${errorType}`);
    this.errorType = errorType;
  }
}

function handleCommonErrors(statusCode: number) {
  if (statusCode >= 200 && statusCode < 300) {
    return;
  }
  switch (statusCode) {
    case 410:
      throw new ChatApiError('CONVERSATION_IS_GONE');
    default:
      throw new ChatApiError('UNKNOWN');
  }
}
