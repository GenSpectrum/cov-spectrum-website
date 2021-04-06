import React from 'react';
import { IfFulfilled, IfPending, IfRejected } from 'react-async';
import { Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import Loader from '../components/Loader';
import { useQueryWithAsyncEncoder } from '../helpers/use-query';
import { allWidgets } from '../widgets';

const host = process.env.REACT_APP_WEBSITE_HOST;

export function EmbedPage() {
  const widgetUrlName = (useParams() as any).widget as string; // TODO(voinovp) use add types for react-router params
  const widget = allWidgets.find(w => w.urlName === widgetUrlName);

  const asyncWidgetProps = useQueryWithAsyncEncoder<any>(widget?.propsEncoder);

  if (!widget) {
    // TODO Redirect to a 404 page
    return <Alert variant='danger'>Widget is unspecified or unsupported</Alert>;
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div>
        This widget is provided by the{' '}
        <a rel='noreferrer' target='_blank' href={host}>
          <span style={{ color: 'orange', fontWeight: 'bold' }}>CoV-Spectrum</span>
        </a>
        .
      </div>
      <div style={{ flexGrow: 1 }}>
        <IfPending state={asyncWidgetProps}>
          <Loader />
        </IfPending>
        <IfRejected state={asyncWidgetProps}>
          <Alert variant='danger'>Failed to load widget</Alert>
        </IfRejected>
        <IfFulfilled state={asyncWidgetProps}>
          {widgetProps => <widget.Component {...widgetProps} />}
        </IfFulfilled>
      </div>
    </div>
  );
}
