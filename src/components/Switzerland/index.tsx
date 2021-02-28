import React, { useEffect, useState, useRef } from 'react';
import { DistributionType, getVariantDistributionData } from '../../services/api';
import { TimeZipCodeDistributionEntry } from '../../services/api-types';
import { AccountService } from '../../services/AccountService';
import * as zod from 'zod';
import { SampleSelectorSchema } from '../../helpers/sample-selector';

import Map from './Map';

const PropsSchema = SampleSelectorSchema;
type Props = zod.infer<typeof PropsSchema> & { width?: number };

const Switzerland = ({ country, mutations, matchPercentage }: Props) => {
  const [distributionData, setDistributionData] = useState<TimeZipCodeDistributionEntry[]>([]);
  const loggedIn = AccountService.isLoggedIn();

  const mapWrapperRef = useRef<HTMLDivElement>(null);
  const [mapWidth, setMapWidth] = useState<number>(800);

  useEffect(() => {
    if (mapWrapperRef.current) {
      console.log('Width is ', mapWrapperRef.current.offsetWidth);
      setMapWidth(mapWrapperRef.current.offsetWidth);
    }
  }, [mapWrapperRef]);

  useEffect(() => {}, [distributionData]);

  useEffect(() => {
    let isSubscribed = true;
    const controller = new AbortController();
    const signal = controller.signal;
    getVariantDistributionData(DistributionType.TimeZipCode, country, mutations, matchPercentage, signal)
      .then(newDistributionData => {
        if (isSubscribed) {
          setDistributionData(newDistributionData);
        }
      })
      .catch(e => {
        console.log('Called fetch data error', e);
      });
    return () => {
      isSubscribed = false;
      controller.abort();
    };
  }, [country, mutations, matchPercentage]);

  return loggedIn && distributionData !== undefined ? (
    <>
      <h2>Number of cases by postal code in Switzerland</h2>
      <div ref={mapWrapperRef}>
        <Map width={mapWidth} distributionData={distributionData} />
      </div>
    </>
  ) : (
    <div></div>
  );
};
export default Switzerland;
