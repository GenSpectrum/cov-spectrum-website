import React, { useState, useEffect } from 'react';

import { Button, Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { VariantTimeDistributionPlot } from '../widgets/VariantTimeDistributionPlot';
import { WidgetWrapper } from './WidgetWrapper';
import { VariantAgeDistributionPlot } from '../widgets/VariantAgeDistributionPlot';
import { dataToUrl } from '../helpers/urlConversion';
import styled from 'styled-components';

import { Country, Variant, DataDistributionConfiguration } from '../helpers/types';

const RowWrapper = styled(Row)`
  /* height: 100rem; */
`;

interface Props {
  country: Country;
  matchPercentage: number;
  variant: Variant;
}

export const VariantDashboard = ({ country, matchPercentage, variant }: Props) => {
  const [variantDistributionPlotData, setVariantDistributionPlotData] = useState<
    DataDistributionConfiguration | undefined
  >(undefined);

  useEffect(() => {
    setVariantDistributionPlotData({
      country: country,
      matchPercentage: matchPercentage,
      mutations: variant.mutations,
    });
  }, [country, matchPercentage, variant]);

  useEffect(() => {
    console.log('Variant data updated to', variantDistributionPlotData);
  }, [variantDistributionPlotData]);

  return variantDistributionPlotData !== undefined ? (
    <>
      <div style={{ display: 'flex' }}>
        <h3 style={{ flexGrow: 1 }}>
          {variant.name ?? 'Unnamed Variant'} in {country}
        </h3>
        <div>
          <Link
            to={
              '/sample?mutations=' +
              variant.mutations.join(',') +
              '&country=' +
              country +
              '&matchPercentage=' +
              matchPercentage
            }
          >
            <Button variant='outline-dark' size='sm'>
              Show samples
            </Button>
          </Link>
        </div>
      </div>

      <p>
        <b>Mutations:</b> {variant.mutations.join(', ')}
      </p>

      <p>
        The following plots show sequences matching <b>{Math.round(matchPercentage * 100)}%</b> of the
        mutations.
      </p>

      <Container fluid='md'>
        <RowWrapper>
          <Col md={7}>
            <WidgetWrapper shareUrl={dataToUrl(variantDistributionPlotData, 'VariantTimeDistribution')}>
              <VariantTimeDistributionPlot data={variantDistributionPlotData} />
            </WidgetWrapper>
          </Col>
          <Col md={5}>
            <WidgetWrapper shareUrl={dataToUrl(variantDistributionPlotData, 'VariantAgeDistribution')}>
              <VariantAgeDistributionPlot data={variantDistributionPlotData} />
            </WidgetWrapper>
          </Col>
        </RowWrapper>
      </Container>
    </>
  ) : (
    <h1>Loading...</h1>
  );
};
