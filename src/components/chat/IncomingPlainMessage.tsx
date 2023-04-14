import { Message } from '@chatscope/chat-ui-kit-react';
import React from 'react';

export type IncomingPlainMessageProps = {
  children: React.ReactNode;
};

export const IncomingPlainMessage = ({ children }: IncomingPlainMessageProps) => {
  return (
    <Message
      model={{
        type: 'custom',
        sender: 'GenSpectrum',
        direction: 'incoming',
        position: 'single',
      }}
    >
      <Message.CustomContent>{children}</Message.CustomContent>
    </Message>
  );
};
