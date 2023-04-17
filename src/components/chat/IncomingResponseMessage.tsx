import { IncomingMessageWithFeedbackButtons } from './IncomingMessageWithFeedbackButtons';
import React from 'react';
import { ChatSystemMessage } from '../../data/chat/types-chat';
import { DataGrid } from '@mui/x-data-grid';

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
        {message.data?.length && <ChatDataTable data={message.data} />}
        {message.textAfterData && <p>{message.textAfterData}</p>}
      </div>
    </IncomingMessageWithFeedbackButtons>
  );
};

type ChatDataTableProps = {
  data: { [key: string]: string | number }[];
};

const ChatDataTable = ({ data }: ChatDataTableProps) => {
  const [pageSize, setPageSize] = React.useState(5);

  function deriveHeader(data: { [key: string]: string | number }[]) {
    const headerFormats = [
      {
        key: 'proportion',
        name: 'Proportion (%)',
        valueFormatter: (params: any) => `${(params.value * 100).toFixed(2)}`,
      },
    ];

    const headerData = Object.keys(data[0]);
    return headerData.map(key => {
      return {
        field: key,
        flex: 1,
        headerName: headerFormats.find(headerName => headerName.key === key)?.name || key,
        valueFormatter: headerFormats.find(headerName => headerName.key === key)?.valueFormatter,
      };
    });
  }

  function deriveRows(data: { [key: string]: string | number }[]) {
    return data.map((row, index) => {
      return { id: index, ...row };
    });
  }

  const headers = deriveHeader(data);
  const rows = deriveRows(data);

  function getHeightOfTable(numberOfRows: number = rows.length) {
    const heightFooter = 3.5;
    const heightHeader = heightFooter;
    const heightLine = 3.25;
    return Math.min(numberOfRows, pageSize) * heightLine + heightFooter + heightHeader;
  }

  return (
    <div style={{ height: `${getHeightOfTable()}rem`, width: '100%', backgroundColor: 'background.paper' }}>
      <DataGrid
        columns={headers}
        rows={rows}
        autoHeight={true}
        pageSize={pageSize}
        onPageSizeChange={newPageSize => {
          setPageSize(newPageSize);
        }}
        rowsPerPageOptions={[5, 10, 20]}
        sx={{
          backgroundColor: 'background.paper',
        }}
      />
    </div>
  );
};
