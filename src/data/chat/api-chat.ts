import { get, HOST } from '../api';
import { ChatConversation, ChatSystemMessage, ChatUserInfo } from './types-chat';

export async function getChatUserInfo(accessKey: string, signal?: AbortSignal): Promise<ChatUserInfo | null> {
  const params = new URLSearchParams();
  params.set('accessKey', accessKey);
  const res = await get(`/chat/myInfo?${params.toString()}`, signal);
  if (res.status === 401) {
    return null;
  } else if (!res.ok) {
    throw new Error('Error fetching data');
  }
  return (await res.json()) as ChatUserInfo;
}

export async function getChatConversation(
  accessKey: string,
  conversationId: number,
  signal?: AbortSignal
): Promise<ChatConversation> {
  const params = new URLSearchParams();
  params.set('accessKey', accessKey);
  const res = await get(`/chat/conversation/${conversationId}?${params.toString()}`, signal);
  if (!res.ok) {
    throw new Error('Error fetching data');
  }
  return (await res.json()) as ChatConversation;
}

export async function chatSendMessage(
  accessKey: string,
  conversationId: number,
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
