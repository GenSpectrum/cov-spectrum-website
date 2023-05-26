import { MessageInput, SendButton } from '@chatscope/chat-ui-kit-react';
import { getRandomChatPrompt } from '../../data/chat/chat-example-prompts';
import { GiPerspectiveDiceSixFacesRandom } from 'react-icons/gi';
import { FaMicrophone } from 'react-icons/fa';
import { ProgressBar } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import { useFocus } from '../../helpers/use-focus';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

export type CustomMessageInputProps = {
  disabled: boolean;
  maxLength: number;
  onMessageSend: (content: string, randomlyGenerated?: boolean) => void;
};

type MessageInputTriplet = {
  innerHtml: string;
  textContent: string;
  innerText: string | undefined;
};

const EMPTY_CHAT_INPUT = {
  innerHtml: '<br>',
  textContent: '<br>',
  innerText: '',
};

export const CustomMessageInput = ({ disabled, maxLength, onMessageSend }: CustomMessageInputProps) => {
  const [messageInputRef, setMessageInputFocus] = useFocus();
  const [contentInMessageInput, setContentInMessageInput] = useState<MessageInputTriplet>(EMPTY_CHAT_INPUT);
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
    if (
      typeof contentInMessageInput.innerText === 'string' &&
      contentInMessageInput.innerText.trim().length === 0
    ) {
      setHistoryPosition(history.length);
    }
  }, [contentInMessageInput.innerText, history]);

  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  const changeContentFromUserTyping = (
    innerHtml: string,
    textContent: string,
    innerText: string | undefined
  ) => {
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
      let content;
      if (newProposedPosition === history.length) {
        content = EMPTY_CHAT_INPUT;
      } else {
        const text = history[newProposedPosition];
        content = { innerHtml: text, textContent: text, innerText: text };
      }
      setHistoryPosition(newProposedPosition);
      setContentInMessageInput(content);
    }
  };

  const sendMessage = async (content: string, randomlyGenerated?: boolean) => {
    if (listening) {
      SpeechRecognition.stopListening();
      resetTranscript();
    }
    setContentInMessageInput(EMPTY_CHAT_INPUT);
    setHistory([...history, content]);
    onMessageSend(content, randomlyGenerated);
  };

  useEffect(() => {
    if (transcript !== '') {
      setContentInMessageInput({ innerHtml: transcript, textContent: transcript, innerText: transcript });
    }
  }, [transcript, setContentInMessageInput]);

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
      <button
        className={`cs-button ${listening ? 'text-red-600' : ''}`}
        style={{
          fontSize: '1.8em',
          marginLeft: 0,
          paddingLeft: '0.2em',
          paddingRight: 0,
        }}
        onClick={() => {
          if (listening) {
            SpeechRecognition.stopListening();
            resetTranscript();
          } else {
            SpeechRecognition.startListening({ continuous: true });
          }
        }}
      >
        <FaMicrophone />
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
          placeholder={'Send'}
          onClick={() => sendMessage(contentInMessageInput.textContent)}
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
