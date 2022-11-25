import React, { useContext, useEffect, useRef } from 'react';
import { DeregistrationHandle, ExportManagerContext } from '../components/CombinedExport/ExportManager';
import { csvStringify } from '../helpers/csvStringifyHelper';
import download from 'downloadjs';
import { pprettyFileFormats, PprettyRequest } from '../data/ppretty/ppretty-request';
import { getPlotUrl } from '../data/ppretty/api-ppretty';
import { PprettyGridExportManagerContext } from '../components/CombinedExport/PprettyGridExportManager';

interface Props {
  name: string;
  csvData?: { [key: string]: any }[];
  pprettyRequest?: PprettyRequest;
  children: React.ReactNode;
}

// Adds items to "Export" dropdown to download the wrapped component as an image or CSV
const DownloadWrapper = ({ name = 'plot', csvData, pprettyRequest, children }: Props) => {
  const componentRef = useRef(null);

  const exportManager = useContext(ExportManagerContext);
  const pprettyGridExportManager = useContext(PprettyGridExportManagerContext);

  useEffect(() => {
    if (pprettyRequest) {
      const handles: DeregistrationHandle[] = [];
      for (const format of pprettyFileFormats) {
        const handle = exportManager.register('Download ' + format.toUpperCase(), async () => {
          const pprettyUrl = await getPlotUrl(pprettyRequest, format);
          window.open(pprettyUrl);
        });
        handles.push(handle);
      }

      const pprettyHandle = pprettyGridExportManager.register(pprettyRequest);

      return () => {
        handles.forEach(handle => handle.deregister());
        pprettyHandle.deregister();
      };
    }
  }, [componentRef, pprettyRequest, exportManager, pprettyGridExportManager, name]);

  useEffect(() => {
    if (csvData) {
      const handle = exportManager.register('Download CSV', async () => {
        download(await csvStringify(csvData), `${name}.csv`, 'text/csv');
      });
      return handle.deregister;
    }
  }, [componentRef, csvData, exportManager, name]);

  return (
    <div className='relative h-full' ref={componentRef}>
      {children}
    </div>
  );
};

export default DownloadWrapper;
