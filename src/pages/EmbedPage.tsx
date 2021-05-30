import React, { useRef } from 'react';
import { IfFulfilled, IfPending, IfRejected } from 'react-async';
import { useParams } from 'react-router-dom';
import Loader from '../components/Loader';
import { useQueryWithAsyncEncoder } from '../helpers/use-query';
import { allWidgets } from '../widgets';
import { DecodedMergedWidgetProps } from '../widgets/Widget';
import styled from 'styled-components';
import { Alert, AlertVariant } from '../helpers/ui';
import { ExportManager, ExportManagerContext } from '../components/CombinedExport/ExportManager';

const host = process.env.REACT_APP_WEBSITE_HOST;

const Wrapper = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  border: 1px solid darkgray;
  padding: 15px;
  border-radius: 10px;
`;

const Header = styled.div`
  margin-bottom: 5px;
  font-size: small;
  text-align: right;
`;

export function EmbedPage() {
  const widgetUrlName = (useParams() as any).widget as string; // TODO(voinovp) use add types for react-router params
  const widget = allWidgets.find(w => w.urlName === widgetUrlName);

  const asyncWidgetProps = useQueryWithAsyncEncoder<DecodedMergedWidgetProps>(widget?.mergedPropsEncoder);

  // This export manager is effectively never used, since there is
  // no "Export" button. It is here to prevent warnings about a
  // missing "ExportManagerContext.Provider", since there may
  // be things which use ExportManager.register() inside the widget.
  const exportManagerRef = useRef(new ExportManager(false));

  if (!widget) {
    // TODO Redirect to a 404 page
    return <Alert variant={AlertVariant.DANGER}>Widget is unspecified or unsupported</Alert>;
  }

  const renderHeader = (href: string | undefined) => (
    <>
      Find more information on{' '}
      <a rel='noreferrer' target='_blank' href={href}>
        <span style={{ color: 'orange', fontWeight: 'bold' }}>CoV-Spectrum</span>
      </a>
      .
    </>
  );

  return (
    <Wrapper>
      <Header>
        <IfPending state={asyncWidgetProps}>{renderHeader(host)}</IfPending>
        <IfRejected state={asyncWidgetProps}>{renderHeader(host)}</IfRejected>
        <IfFulfilled state={asyncWidgetProps}>
          {({ shared }) => renderHeader(shared.originalPageUrl || host)}
        </IfFulfilled>
      </Header>
      <div style={{ flexGrow: 1 }}>
        <IfPending state={asyncWidgetProps}>
          <Loader />
        </IfPending>
        <IfRejected state={asyncWidgetProps}>
          <Alert variant={AlertVariant.DANGER}>Failed to load widget</Alert>
        </IfRejected>
        <IfFulfilled state={asyncWidgetProps}>
          {({ specific }) => (
            <ExportManagerContext.Provider value={exportManagerRef.current}>
              <widget.Component {...specific} />
            </ExportManagerContext.Provider>
          )}
        </IfFulfilled>
      </div>
    </Wrapper>
  );
}
