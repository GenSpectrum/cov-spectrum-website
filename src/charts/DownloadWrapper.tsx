import React, { useRef } from 'react';

import { exportComponentAsPNG } from 'react-component-export-image';
import { FaCloudDownloadAlt } from 'react-icons/fa';
import { BiTable } from 'react-icons/bi';
import ReactTooltip from 'react-tooltip';
import styled, { css } from 'styled-components';
import { CSVLink } from 'react-csv';

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

const DownloadButton = styled(FaCloudDownloadAlt)`
  ${baseButtonStyles}
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

  const exportOptions = {
    fileName: name + '.png',
    html2CanvasOptions: {
      scale: 8,
    },
  };

  return (
    <>
      <div className="relative h-full" id='download wrapper wrapper'>
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
        <DownloadButton
          data-for='downloadPNG'
          data-tip='Download this chart as PNG image.'
          size={BUTTON_SIZE}
          className={CLASS_STYLE}
          onClick={() => exportComponentAsPNG(componentRef, exportOptions)}
        />
        <div className="relative h-full" id='image-download-container' ref={componentRef}>
          {children}
        </div>
      </div>
      <ReactTooltip id='downloadPNG' delayShow={DELAY_SHOW} />
      <ReactTooltip id='downloadCSV' delayShow={DELAY_SHOW} />
    </>
  );
};

export default DownloadWrapper;
