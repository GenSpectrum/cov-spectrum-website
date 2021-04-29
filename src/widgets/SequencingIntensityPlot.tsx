import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import { getSequencingIntensity } from '../services/api';
import { SequencingIntensityEntry, Country, CountrySchema } from '../services/api-types';
import { Widget } from './Widget';
import * as zod from 'zod';
import { AsyncZodQueryEncoder } from '../helpers/query-encoder';
import TimeIntensityChart, { TimeIntensityEntry } from '../charts/TimeIntensityChart';
import Loader from '../components/Loader';
import { exportComponentAsJPEG } from 'react-component-export-image';
import { FaCloudDownloadAlt } from 'react-icons/fa';
import styled from 'styled-components';

interface Props {
  country: Country;
}

const groupByMonth = (entries: SequencingIntensityEntry[]): TimeIntensityEntry[] => {
  const groupedEntries = _(
    entries.map(d => ({
      firstDayInWeek: d.x,
      yearWeek: d.x.split('-')[0] + '-' + d.x.split('-')[1],
      proportion: d.y.numberSequenced,
      quantity: d.y.numberCases,
    }))
  )
    .groupBy('yearWeek')
    .map((monthData, id) => ({
      id: id,
      month: monthData[0].yearWeek,
      proportion: _.sumBy(monthData, 'proportion'),
      quantity: _.sumBy(monthData, 'quantity'),
    }))
    .value();
  return groupedEntries;
};

const processData = (data: SequencingIntensityEntry[]): any => groupByMonth(data);

export const SequencingIntensityPlot = ({ country }: Props) => {
  const [data, setData] = useState<SequencingIntensityEntry[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isSubscribed = true;
    const controller = new AbortController();
    const signal = controller.signal;
    setIsLoading(true);
    if (country) {
      getSequencingIntensity({ country, signal }).then(newSequencingData => {
        if (isSubscribed) {
          setData(newSequencingData);
        }
        setIsLoading(false);
      });
    }

    return () => {
      isSubscribed = false;
      controller.abort();
      setIsLoading(false);
    };
  }, [country]);

  const componentRef = useRef(null);

  const exportOptions = {
    fileName: 'plot.jpg',
  };

  return data === undefined || isLoading ? (
    <Loader />
  ) : (
    <ImageDownloadWrapper>
      <TimeIntensityChart data={processData(data)} onClickHandler={(e: unknown) => true} />
    </ImageDownloadWrapper>
  );
};

const DownloadButton = styled(FaCloudDownloadAlt)`
  position: absolute;
  top: 8px;
  right: 8px;
  &:hover {
    cursor: pointer;
  }
`;

const Wrapper = styled.div`
  position: relative;
`;
//Adds button to download wrapper component as an image
export const ImageDownloadWrapper = ({ fileName = 'plot.jpg', ...props }) => {
  const componentRef = useRef(null);

  const exportOptions = {
    fileName: fileName,
  };

  return (
    <>
      <Wrapper>
        <DownloadButton onClick={() => exportComponentAsJPEG(componentRef, exportOptions)} />
        <div id='image-download-container' ref={componentRef}>
          {props.children}
        </div>
      </Wrapper>
    </>
  );
};

export const SequencingIntensityPlotWidget = new Widget(
  new AsyncZodQueryEncoder(
    zod.object({
      country: CountrySchema,
    }),
    async (decoded: Props) => decoded,
    async encoded => encoded
  ),
  SequencingIntensityPlot,
  'SequencingIntensityPlot'
);
