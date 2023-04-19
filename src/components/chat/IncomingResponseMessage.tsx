import { IncomingMessageWithFeedbackButtons } from './IncomingMessageWithFeedbackButtons';
import React from 'react';
import { ChatSystemMessage } from '../../data/chat/types-chat';
import { DataGrid, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';

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
  const [paginationModel, setPaginationModel] = React.useState({
    pageSize: 10,
    page: 0,
  });

  function deriveHeaders({ data }: ChatDataTableProps) {
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

  function deriveRows({ data }: ChatDataTableProps) {
    return data.map((row, index) => {
      return { id: index, ...row };
    });
  }

  const headers = deriveHeaders({ data });
  const rows = deriveRows({ data });

  function getHeightOfTable(numberOfRows: number = rows.length) {
    const heightFooter = 3.5;
    const heightHeader = heightFooter;
    const heightToolbar = heightHeader;
    const baseElementsRem = heightFooter + heightHeader + heightToolbar;
    const heightLinePx = 25;
    return `calc(${baseElementsRem}rem + ${
      Math.min(numberOfRows, paginationModel.pageSize) * heightLinePx
    }px)`;
  }

  return (
    <div style={{ height: getHeightOfTable(), backgroundColor: 'background.paper' }}>
      <DataGrid
        columns={headers}
        rows={rows}
        rowHeight={25}
        paginationModel={paginationModel}
        pageSizeOptions={[10, 25, 50]}
        onPaginationModelChange={model => setPaginationModel(model)}
        sx={{
          backgroundColor: 'background.paper',
        }}
        slots={{ toolbar: CustomToolbar }}
      />
    </div>
  );
};

function CustomToolbar() {
  return (
    <GridToolbarContainer sx={{ justifyContent: 'flex-end' }}>
      <GridToolbarExport printOptions={{ disableToolbarButton: true }} />
    </GridToolbarContainer>
  );
}
