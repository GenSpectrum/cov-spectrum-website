import React, { useRef } from 'react';

import { exportComponentAsPNG } from 'react-component-export-image';
import { FaCloudDownloadAlt } from 'react-icons/fa';
import { BiTable } from 'react-icons/bi';
import ReactTooltip from 'react-tooltip';
import styled, { css } from 'styled-components';
import { CSVLink } from 'react-csv';

const BUTTON_SIZE = '2.5em';

const baseButtonStyles = css`
  position: absolute;
  z-index: 10;
  top: 0px;
  right: 8px;
  padding: 8px 8px 8px 8px;
  transform: translate(0%, 0%);
  transition: 0.1s ease-in;
  &:hover {
    cursor: pointer;
    transform: translate(0%, -10%);
    transition: 0.2s ease-out;
  }
`;

const DownloadButton = styled(FaCloudDownloadAlt)`
  ${baseButtonStyles}
`;
const DownloadDataButton = styled(BiTable)`
  ${baseButtonStyles}
  right: 38px;
`;

const Wrapper = styled.div`
  position: relative;
  height: 100%;
`;

const DownloadContainer = styled.div`
  position: relative;
  height: 100%;
`;

//Adds button to download wrapper component as an image
const DownloadWrapper = ({
  name = 'plot',
  rawData = [],
  dataProcessor = (data: any[]) => data,
  ...props
}: any) => {
  const componentRef = useRef(null);

  const exportOptions = {
    fileName: name + '.png',
    html2CanvasOptions: {
      scale: 8,
    },
  };

  //keep for debug
  const downloadCSV = () => {
    // console.log("downloading data CVS raw data");
    // console.log(rawData);
    // console.log("processed");
    // console.log(dataProcessor(rawData));
  };

  return (
    <>
      <Wrapper id='download wrapper wrapper'>
        {rawData.length > 0 && (
          <CSVLink
            data={dataProcessor(rawData)}
            filename={`${name}.csv`}
            onClick={downloadCSV}
          >
            <DownloadDataButton
              data-for='downloadCSV'
              data-tip='Download chart data as CSV.'
              size={BUTTON_SIZE}
              color='#95a5a6'
              onClick={downloadCSV}
            />
          </CSVLink>
        )}
        <DownloadButton
          data-for='downloadPNG'
          data-tip='Download this chart as PNG image.'
          size={BUTTON_SIZE}
          color='#95a5a6'
          onClick={() => exportComponentAsPNG(componentRef, exportOptions)}
        />
        <DownloadContainer id='image-download-container' ref={componentRef}>
          {props.children}
        </DownloadContainer>
      </Wrapper>
      <ReactTooltip id='downloadPNG' delayShow={500} />
      <ReactTooltip id='downloadCSV' delayShow={500} />
    </>
  );
};

export default DownloadWrapper;
