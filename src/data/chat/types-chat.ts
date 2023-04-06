export type ChatUserInfo = {
  id: number;
  quota: number;
  quotaUsed: number;
  conversationIds: number[];
};

export type ChatConversation = {
  id: number;
  owner: number;
  messages: (ChatUserMessage | ChatSystemMessage)[];
};

export type ChatUserMessage = {
  role: 'user';
  content: string;
};

export type ChatSystemMessage = {
  role: 'GenSpectrum';
  text: string;
  data?: any[];
};
