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
  id?: number; // The ID will only be provided if the message is logged
  textBeforeData: string;
  data?: any[];
  textAfterData?: string;
};
