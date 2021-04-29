import React, { useRef } from 'react';

import { exportComponentAsJPEG } from 'react-component-export-image';
import { FaCloudDownloadAlt } from 'react-icons/fa';
import { BiTable } from 'react-icons/bi';
import ReactTooltip from 'react-tooltip';
import styled, {css} from 'styled-components';

const baseButtonStyles = css`
  position: absolute;
  z-index: 10;
  top: 0px;
  right: 8px;
  padding: 8px 8px 8px 8px;
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
const DownloadWrapper = ({ name = 'plot', data = [], ...props }: any) => {
  const componentRef = useRef(null);

  const exportOptions = {
    fileName: name + '.jpg',
    html2CanvasOptions: {
      scale: 8,
    },
  };

  return (
    <>
      <Wrapper id='download wrapper wrapper'>
        <DownloadDataButton
          data-for='downloadCSV'
          data-tip='Download chart data as CSV.'
          size='2.5em'
          color='#95a5a6'
        />
        <DownloadButton
          data-for='downloadJPEG'
          data-tip='Download this chart as JPEG image.'
          size='2.5em'
          color='#95a5a6'
          onClick={() => exportComponentAsJPEG(componentRef, exportOptions)}
        />
        <DownloadContainer id='image-download-container' ref={componentRef}>
          {props.children}
        </DownloadContainer>
      </Wrapper>
      <ReactTooltip id='downloadJPEG' delayShow={1000} />
      <ReactTooltip id='downloadCSV' delayShow={1000} />
    </>
  );
};

export default DownloadWrapper;
