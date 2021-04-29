import React, { useState, useEffect, useRef } from 'react';

import { exportComponentAsJPEG } from 'react-component-export-image';
import { FaCloudDownloadAlt } from 'react-icons/fa';
import ReactTooltip from 'react-tooltip';
import styled from 'styled-components';

const DownloadButton = styled(FaCloudDownloadAlt)`
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

const Wrapper = styled.div`
  position: relative;
`;

const DownloadContainer = styled.div`
    position: relative;
`

//Adds button to download wrapper component as an image
const DownloadWrapper = ({ name = 'plot', ...props }) => {
  const componentRef = useRef(null);

  const exportOptions = {
    fileName: name + '.jpg',
  };

  return (
    <>
      <Wrapper>
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
    </>
  );
};

export default DownloadWrapper;
