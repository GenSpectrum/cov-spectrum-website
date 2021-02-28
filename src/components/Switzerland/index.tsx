import React, { useEffect, useState, useRef } from 'react';
import { DistributionType, getVariantDistributionData } from '../../services/api';
import { TimeZipCodeDistributionEntry } from '../../services/api-types';
import { AccountService } from '../../services/AccountService';
import * as zod from 'zod';
import { SampleSelectorSchema } from '../../helpers/sample-selector';
import { useResizeDetector } from 'react-resize-detector';

import Map from './Map';

const PropsSchema = SampleSelectorSchema;
type Props = zod.infer<typeof PropsSchema> & { width?: number };

const Switzerland = ({ country, mutations, matchPercentage }: Props) => {
  const [distributionData, setDistributionData] = useState<TimeZipCodeDistributionEntry[]>([]);
  const loggedIn = AccountService.isLoggedIn();
  const { width, height, ref } = useResizeDetector();

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
      <div ref={ref as React.MutableRefObject<HTMLInputElement>}>
        {/* <h4>Number of cases by postal code</h4> */}
        <Map width={width ?? 1000} distributionData={distributionData} />
      </div>
    </>
  ) : (
    <div>Please log in to view the geographical distribution of cases.</div>
  );
};
export default Switzerland;
