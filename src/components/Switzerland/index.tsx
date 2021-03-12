import React, { useEffect, useState } from 'react';
import { DistributionType, getVariantDistributionData } from '../../services/api';
import { TimeZipCodeDistributionEntry } from '../../services/api-types';
import { AccountService } from '../../services/AccountService';
import * as zod from 'zod';
import { SampleSelectorSchema } from '../../helpers/sample-selector';
import { useResizeDetector } from 'react-resize-detector';
import styled from 'styled-components';

import Map from './Map';

const MAP_SIDE_PADDING = 2;

const MapWrapper = styled.div`
  padding: 1rem ${MAP_SIDE_PADDING}rem 1rem ${MAP_SIDE_PADDING}rem;
`;

const PropsSchema = SampleSelectorSchema;
type Props = zod.infer<typeof PropsSchema>;

const Switzerland = ({ country, mutations, matchPercentage }: Props) => {
  const [distributionData, setDistributionData] = useState<TimeZipCodeDistributionEntry[]>([]);
  const loggedIn = AccountService.isLoggedIn();
  const { width, ref } = useResizeDetector();

  useEffect(() => {
    let isSubscribed = true;
    const controller = new AbortController();
    const signal = controller.signal;
    getVariantDistributionData(
      {
        distributionType: DistributionType.TimeZipCode,
        country,
        mutations,
        matchPercentage,
      },
      signal
    )
      .then(newDistributionData => {
        if (isSubscribed) {
          setDistributionData(newDistributionData);
        }
      })
      .catch(e => {
        console.log('Error fetching data in Switzerland map');
      });
    return () => {
      isSubscribed = false;
      controller.abort();
    };
  }, [country, mutations, matchPercentage]);

  return loggedIn && distributionData !== undefined ? (
    <>
      <div>
        <p>Number of cases by postal code (PLZ)</p>
        <MapWrapper ref={ref as React.MutableRefObject<HTMLInputElement>}>
          <Map width={width} distributionData={distributionData} />
        </MapWrapper>
      </div>
    </>
  ) : (
    <div>Please log in to view the geographical distribution of cases.</div>
  );
};
export default Switzerland;
