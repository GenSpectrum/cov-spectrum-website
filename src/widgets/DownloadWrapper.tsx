import React, { useContext, useEffect, useRef } from 'react';
import { exportComponentAsPNG } from 'react-component-export-image';
import { ExportManagerContext } from '../components/CombinedExport/ExportManager';
import { CSVstringify } from '../helpers/CSVstringify';
import download from 'downloadjs';

interface Props {
  name: string;
  csvData?: { [key: string]: any }[];
  children: React.ReactNode;
}

// Adds items to "Export" dropdown to download the wrapped component as an image or CSV
const DownloadWrapper = ({ name = 'plot', csvData, children }: Props) => {
  const componentRef = useRef(null);

  const exportManager = useContext(ExportManagerContext);

  useEffect(() => {
    const handle = exportManager.register('Download PNG', () => {
      exportComponentAsPNG(componentRef, {
        fileName: name + '.png',
        html2CanvasOptions: {
          scale: 8,
        },
      });
    });

    return handle.deregister;
  }, [componentRef, exportManager, name]);

  useEffect(() => {
    if (csvData) {
      const handle = exportManager.register('Download CSV', async () => {
        download(await CSVstringify(csvData), `${name}.csv`, 'text/csv');
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
