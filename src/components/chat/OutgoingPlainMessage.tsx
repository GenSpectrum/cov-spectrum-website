import { Message } from '@chatscope/chat-ui-kit-react';
import React from 'react';

export type OutgoingPlainMessageProps = {
  children: React.ReactNode;
};

export const OutgoingPlainMessage = ({ children }: OutgoingPlainMessageProps) => {
  return (
    <Message
      model={{
        type: 'custom',
        sender: 'You',
        direction: 'outgoing',
        position: 'single',
      }}
    >
      <Message.CustomContent>{children}</Message.CustomContent>
    </Message>
  );
};
