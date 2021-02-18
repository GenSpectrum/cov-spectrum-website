import React from 'react';
import { useParams } from 'react-router-dom';
import { allWidgets } from '../widgets';
import { useQuerySafe } from '../helpers/use-query';

const host = process.env.REACT_APP_WEBSITE_HOST;

export function EmbedPage() {
  const widgetUrlName = (useParams() as any).widget as string; // TODO(voinovp) use add types for react-router params
  const widget = allWidgets.find(w => w.urlName === widgetUrlName);
  const widgetProps = useQuerySafe(widget?.propsEncoder);

  if (!widget || !widgetProps) {
    // TODO Redirect to a 404 page
    return <div>Widget is unspecified, unsupported, or has invalid parameters</div>;
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
        <widget.Component {...widgetProps} />
      </div>
    </div>
  );
}
