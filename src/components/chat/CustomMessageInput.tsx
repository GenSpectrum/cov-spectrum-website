import { MessageInput, SendButton } from '@chatscope/chat-ui-kit-react';
import { getRandomChatPrompt } from '../../data/chat/chat-example-prompts';
import { GiPerspectiveDiceSixFacesRandom } from 'react-icons/gi';
import { ProgressBar } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import { useFocus } from '../../helpers/use-focus';

export type CustomMessageInputProps = {
  disabled: boolean;
  maxLength: number;
  onMessageSend: (content: string, randomlyGenerated?: boolean) => void;
};

type MessageInputTriplet = {
  innerHtml: string;
  textContent: string;
  innerText: string;
};

export const CustomMessageInput = ({ disabled, maxLength, onMessageSend }: CustomMessageInputProps) => {
  const [messageInputRef, setMessageInputFocus] = useFocus();
  const [contentInMessageInput, setContentInMessageInput] = useState<MessageInputTriplet>({
    innerHtml: '',
    textContent: '',
    innerText: '',
  });
  const [history, setHistory] = useState<string[]>([]);
  const [historyPosition, setHistoryPosition] = useState<number | undefined>();

  // Set focus to the input field whenever it switches from disabled to enabled
  useEffect(() => {
    if (!disabled) {
      setMessageInputFocus();
    }
  }, [setMessageInputFocus, disabled]);

  const messageLengthProportionUsed = contentInMessageInput.textContent.length / maxLength;
  let messageLengthBarVariant: 'success' | 'warning' | 'danger' = 'success';
  if (messageLengthProportionUsed >= 0.75) {
    messageLengthBarVariant = 'danger';
  } else if (messageLengthProportionUsed >= 0.5) {
    messageLengthBarVariant = 'warning';
  }

  useEffect(() => {
    if (contentInMessageInput.textContent.length === 0) {
      setHistoryPosition(history.length);
    }
  }, [contentInMessageInput.textContent, history]);

  const changeContentFromUserTyping = (innerHtml: string, textContent: string, innerText: string) => {
    if (textContent.length <= maxLength) {
      setContentInMessageInput({ innerHtml, textContent, innerText });
    }
    if (textContent.length > 0) {
      setHistoryPosition(undefined);
    }
  };

  const changeContentFromHistory = (direction: 'up' | 'down') => {
    if (historyPosition !== undefined) {
      const newProposedPosition = direction === 'up' ? historyPosition - 1 : historyPosition + 1;
      if (newProposedPosition < 0 || newProposedPosition > history.length) {
        return;
      }
      let content: string;
      if (newProposedPosition === history.length) {
        content = '';
      } else {
        content = history[newProposedPosition];
      }
      setHistoryPosition(newProposedPosition);
      setContentInMessageInput({ innerHtml: content, textContent: content, innerText: content });
    }
  };

  const sendMessage = async (content: string, randomlyGenerated?: boolean) => {
    setContentInMessageInput({ innerHtml: '', textContent: '', innerText: '' });
    setHistory([...history, content]);
    onMessageSend(content, randomlyGenerated);
  };

  return (
    <div
      /* @ts-ignore */
      as={MessageInput}
      // The margin is to avoid the message input bar to be hidden on mobile if one does not scroll down.
      className='mb-14'
      style={{
        display: 'flex',
        flexDirection: 'row',
        borderTop: '1px solid #d1dbe4',
        borderBottom: '1px solid #d1dbe4',
      }}
    >
      <button
        className='cs-button'
        style={{
          fontSize: '1.8em',
          marginLeft: 0,
          paddingLeft: '0.2em',
          paddingRight: 0,
        }}
        onClick={() => sendMessage(getRandomChatPrompt(), true)}
      >
        <GiPerspectiveDiceSixFacesRandom />
      </button>
      <MessageInput
        ref={messageInputRef}
        sendButton={false}
        attachButton={false}
        style={{
          flexGrow: 1,
          borderTop: 0,
          flexShrink: 'initial',
        }}
        placeholder={`Let's chat about variants`}
        disabled={disabled}
        onChange={changeContentFromUserTyping}
        value={contentInMessageInput.innerHtml}
        onSend={(_, textContent) => sendMessage(textContent)}
        onKeyUp={event => {
          if (event.key === 'ArrowUp') {
            changeContentFromHistory('up');
          } else if (event.key === 'ArrowDown') {
            changeContentFromHistory('down');
          }
        }}
      />
      <div className='px-1 flex flex-column'>
        <SendButton
          style={{
            fontSize: '1.2em',
          }}
          onClick={() => sendMessage(contentInMessageInput.innerText)}
        />
        <ProgressBar
          striped
          variant={messageLengthBarVariant}
          now={contentInMessageInput.textContent.length}
          max={maxLength}
          className='mb-2 h-1.5'
        />
      </div>
    </div>
  );
};
