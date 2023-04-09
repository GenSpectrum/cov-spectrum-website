export type ChatConversation = {
  id: string;
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
