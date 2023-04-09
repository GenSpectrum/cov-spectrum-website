import { get, post, HOST } from '../api';
import { ChatConversation, ChatSystemMessage } from './types-chat';

export async function checkAuthentication(accessKey: string, signal?: AbortSignal): Promise<boolean> {
  const params = new URLSearchParams();
  params.set('accessKey', accessKey);
  const res = await get(`/chat/authenticate?${params.toString()}`, signal);
  if (!res.ok) {
    throw new Error('Error fetching data');
  }
  return (await res.json()).success;
}

export async function createConversation(
  accessKey: string,
  toBeLogged: boolean,
  signal?: AbortSignal
): Promise<ChatConversation> {
  const params = new URLSearchParams();
  params.set('accessKey', accessKey);
  params.set('toBeLogged', toBeLogged.toString());
  const res = await post(`/chat/createConversation?${params.toString()}`, undefined, signal);
  if (!res.ok) {
    throw new Error('Error fetching data');
  }
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
  if (!res.ok) {
    throw new Error('Error fetching data');
  }
  return (await res.json()) as ChatSystemMessage;
}
