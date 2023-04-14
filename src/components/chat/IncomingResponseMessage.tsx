import { IncomingMessageWithFeedbackButtons } from './IncomingMessageWithFeedbackButtons';
import { Table } from 'react-bootstrap';
import React from 'react';
import { ChatSystemMessage } from '../../data/chat/types-chat';

export type IncomingResponseMessageProps = {
  message: ChatSystemMessage;
  toBeLogged: boolean;
  onRateUp: () => void;
  onRateDown: () => void;
  onComment: (comment: string) => void;
};

export const IncomingResponseMessage = ({
  message,
  toBeLogged,
  onRateUp,
  onRateDown,
  onComment,
}: IncomingResponseMessageProps) => {
  return (
    <IncomingMessageWithFeedbackButtons
      showFeedbackButtons={toBeLogged!}
      onRateUp={onRateUp}
      onRateDown={onRateDown}
      onComment={onComment}
    >
      <div>
        <p>{message.textBeforeData}</p>
        {message.data && message.data.length && (
          <div className='m-2 mt-4 max-h-[300px] overflow-auto'>
            <Table striped bordered hover>
              <thead>
                <tr>
                  {Object.keys(message.data[0]).map(key => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {message.data.map((row, index) => (
                  <tr key={index}>
                    {Object.keys(message.data![0]).map(key => (
                      <td key={key}>{row[key]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
        {message.textAfterData && <p>{message.textAfterData}</p>}
      </div>
    </IncomingMessageWithFeedbackButtons>
  );
};
