import React, { useContext, useEffect, useRef } from 'react';
import { exportComponentAsPNG } from 'react-component-export-image';
import { CSVLink } from 'react-csv';
import { BiTable } from 'react-icons/bi';
import ReactTooltip from 'react-tooltip';
import styled, { css } from 'styled-components';
import { ExportManagerContext } from '../components/CombinedExport/ExportManager';

const BUTTON_SIZE = '2.5em';
const DELAY_SHOW = 0;
const CLASS_STYLE = 'fill-current text-gray-300 hover:text-gray-500 cursor-pointer';

const baseButtonStyles = css`
  position: absolute;
  z-index: 5;
  top: 0px;
  right: 0px;
  padding: 8px 8px 8px 8px;
`;

const DownloadDataButton = styled(BiTable)`
  ${baseButtonStyles}
  right: 30px;
`;
interface Props {
  name: string;
  rawData?: any[];
  dataProcessor?: (data: any[]) => any;
  children: React.ReactNode;
}
//Adds button to download wrapper component as an image
const DownloadWrapper = ({
  name = 'plot',
  rawData = [],
  dataProcessor = (data: any[]) => data,
  children,
}: Props) => {
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

  return (
    <>
      <div className='relative h-full' id='download wrapper wrapper'>
        {rawData.length > 0 && (
          <CSVLink data={dataProcessor(rawData)} filename={`${name}.csv`}>
            <DownloadDataButton
              data-for='downloadCSV'
              data-tip='Download chart data as CSV.'
              size={BUTTON_SIZE}
              className={CLASS_STYLE}
            />
          </CSVLink>
        )}
        <div className='relative h-full' ref={componentRef}>
          {children}
        </div>
      </div>
      <ReactTooltip id='downloadCSV' delayShow={DELAY_SHOW} />
    </>
  );
};

export default DownloadWrapper;
