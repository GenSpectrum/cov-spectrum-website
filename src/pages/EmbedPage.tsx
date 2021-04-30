import React from 'react';
import { IfFulfilled, IfPending, IfRejected } from 'react-async';
import { Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import Loader from '../components/Loader';
import { useQueryWithAsyncEncoder } from '../helpers/use-query';
import { allWidgets } from '../widgets';
import { DecodedMergedWidgetProps } from '../widgets/Widget';

const host = process.env.REACT_APP_WEBSITE_HOST;

export function EmbedPage() {
  const widgetUrlName = (useParams() as any).widget as string; // TODO(voinovp) use add types for react-router params
  const widget = allWidgets.find(w => w.urlName === widgetUrlName);

  const asyncWidgetProps = useQueryWithAsyncEncoder<DecodedMergedWidgetProps>(widget?.mergedPropsEncoder);

  if (!widget) {
    // TODO Redirect to a 404 page
    return <Alert variant='danger'>Widget is unspecified or unsupported</Alert>;
  }

  const renderHeader = (href: string | undefined) => (
    <>
      This widget is provided by the{' '}
      <a rel='noreferrer' target='_blank' href={href}>
        <span style={{ color: 'orange', fontWeight: 'bold' }}>CoV-Spectrum</span>
      </a>
      .
    </>
  );

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div>
        <IfPending state={asyncWidgetProps}>{renderHeader(host)}</IfPending>
        <IfRejected state={asyncWidgetProps}>{renderHeader(host)}</IfRejected>
        <IfFulfilled state={asyncWidgetProps}>
          {({ shared }) => renderHeader(shared.originalPageUrl || host)}
        </IfFulfilled>
      </div>
      <div style={{ flexGrow: 1 }}>
        <IfPending state={asyncWidgetProps}>
          <Loader />
        </IfPending>
        <IfRejected state={asyncWidgetProps}>
          <Alert variant='danger'>Failed to load widget</Alert>
        </IfRejected>
        <IfFulfilled state={asyncWidgetProps}>
          {({ specific }) => <widget.Component {...specific} />}
        </IfFulfilled>
      </div>
    </div>
  );
}
