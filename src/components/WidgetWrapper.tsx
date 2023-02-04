import React, { useRef, useState } from 'react';
import { ButtonToolbar, Form, Modal } from 'react-bootstrap';
import { ExportButton } from './CombinedExport/ExportButton';
import { ExportManager, ExportManagerContext } from './CombinedExport/ExportManager';
import { NamedCard, TabConfig } from './NamedCard';

// InternalProps are passed by Widget
export interface InternalProps {
  getShareUrl: () => Promise<string>;
  children: React.ReactNode | React.ReactNode[];
  componentLabels?: string[];
}

// LayoutProps as passed by WidgetWrapper to the component responsible for Layout
export interface LayoutProps {
  title: string;
  toolbar?: React.ReactNode | React.ReactNode[];
  children: React.ReactNode | React.ReactNode[];
  tabs?: TabConfig;
}

// ExternalProps are passed by users of Widget.ShareableComponent
export interface ExternalProps {
  title: string;
  toolbarChildren?: React.ReactNode | React.ReactNode[];
  showExport?: boolean;
  height?: number;
  widgetLayout?: React.ComponentType<LayoutProps>;
}
// IMPORTANT externalPropsKeys must be kept in sync with ExternalProps
const externalPropsKeys: (keyof ExternalProps)[] = [
  'title',
  'toolbarChildren',
  'showExport',
  'height',
  'widgetLayout',
];

export function pickExternalProps<T extends { [K in keyof ExternalProps]?: never }>(
  allProps: T
): { external: ExternalProps; remaining: T } {
  const external: { [key: string]: unknown } = {};
  const remaining: { [key: string]: unknown } = {};
  for (const [k, v] of Object.entries(allProps)) {
    if ((externalPropsKeys as string[]).includes(k)) {
      external[k] = v;
    } else {
      remaining[k] = v;
    }
  }
  return { external: external as any as ExternalProps, remaining: remaining as any };
}

type Props = InternalProps & ExternalProps;

export function WidgetWrapper({
  children,
  title,
  toolbarChildren,
  showExport = true,
  height,
  widgetLayout: WidgetLayout = NamedCard,
  componentLabels,
}: Props) {
  const exportManagerRef = useRef(new ExportManager());
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const childrenAsArray: React.ReactNode[] = React.Children.toArray(children);
  const tabs: TabConfig | undefined = componentLabels
    ? {
        activeTabIndex,
        labels: componentLabels,
        onNewTabSelect: setActiveTabIndex,
      }
    : undefined;

  const [shownEmbeddingCode, setShownEmbeddingCode] = useState<string>();

  // HACK(by Chaoran): The embed widget feature was used a few times but has not been as useful as I originally
  // anticipated. It also has not been well-maintained for a while, and we don't have any tests for them. Thus, I'd like
  // to avoid having new people using this feature. The only case where the feature will be useful for the foreseeable
  // future is for the wastewater plots.
  // useEffect(() => {
  //   const handle = exportManagerRef.current.register('Embed widget', async () => {
  //     const embeddingCode = `<iframe src="${host}/embed/${await getShareUrl()}" width="800" height="500" frameborder="0"></iframe>`;
  //     setShownEmbeddingCode(embeddingCode);
  //   });
  //
  //   return handle.deregister;
  // }, [getShareUrl]);

  return (
    <>
      <ExportManagerContext.Provider value={exportManagerRef.current}>
        <WidgetLayout
          title={title}
          toolbar={
            <ButtonToolbar className='mb-1'>
              {showExport && <ExportButton key={title} className='mt-1 ml-1' />}
              {toolbarChildren}
            </ButtonToolbar>
          }
          tabs={tabs}
        >
          <div style={height ? { height } : undefined}>{childrenAsArray[activeTabIndex]}</div>
        </WidgetLayout>
      </ExportManagerContext.Provider>

      <Modal size='lg' show={!!shownEmbeddingCode} onHide={() => setShownEmbeddingCode(undefined)}>
        <Modal.Header closeButton>
          <Modal.Title>Embed widget on your website</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Copy the following code into your website to embed the widget.</p>
          <Form.Control as='textarea' value={shownEmbeddingCode} rows={7} readOnly />
        </Modal.Body>
      </Modal>
    </>
  );
}
