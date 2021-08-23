import React, { useEffect, useMemo, useState } from 'react';
import { ExternalLink } from '../../../components/ExternalLink';
import { WasteWaterDataset } from '../types';
import { getData } from '../loading';
import Loader from '../../../components/Loader';
import { Utils } from '../../../services/Utils';
import { GridCell, PackedGrid } from '../../../components/PackedGrid';
import { WasteWaterLocationTimeWidget } from '../WasteWaterLocationTimeWidget';
import _ from 'lodash';
import { ShowMoreButton } from '../../../helpers/ui';
import { createLocation } from 'history';

export const WasteWaterStoryPage = () => {
  const [wasteWaterData, setWasteWaterData] = useState<WasteWaterDataset | undefined>(undefined);
  useEffect(() => {
    getData({
      country: 'Switzerland',
    }).then(dataset => dataset && setWasteWaterData(dataset));
  }, []);

  const locationData = useMemo(() => {
    if (!wasteWaterData) {
      return undefined;
    }
    const locationGrouped = _.sortBy(
      [...Utils.groupBy(wasteWaterData, d => d.location).values()],
      [d => d[0].location]
    );
    return locationGrouped.map(locationData => {
      const location = locationData[0].location;
      const variantsTimeseriesSummaries = locationData.map(({ variantName, data }) => ({
        name: variantName,
        data: data.timeseriesSummary,
      }));
      return {
        location,
        view: (
          <WasteWaterLocationTimeWidget.ShareableComponent
            country='Switzerland'
            location={location}
            title={location}
            variants={variantsTimeseriesSummaries}
            height={300}
            toolbarChildren={[
              <ShowMoreButton to={createLocation('/story/wastewater-in-switzerland/location/' + location)} />,
            ]}
          />
        ),
      };
    });
  }, [wasteWaterData]);

  if (!locationData) {
    return <Loader />;
  }

  return (
    <div className='px-4 md:px-8'>
      <h1>Wastewater in Switzerland</h1>
      <div className='italic'>
        by{' '}
        <ExternalLink url='https://bsse.ethz.ch/cbg/'>Computational Biology Group, ETH Zurich</ExternalLink>
      </div>
      <p>
        The present page reports estimates of the prevalence of different genomic variants of SARS-CoV-2
        obtained from wastewater samples. Samples are collected daily at {locationData.length} Swiss
        wastewater treatment plants (by{' '}
        <ExternalLink url='https://www.eawag.ch/en/department/sww/projects/sars-cov2-in-wastewater/'>
          Eawag
        </ExternalLink>
        ).
      </p>
      <p>
        We analyze the wastewater samples using next-generation sequencing (done by{' '}
        <ExternalLink url='https://fgcz.ch/'>FGCZ</ExternalLink>), process the resulting short-read data with{' '}
        <ExternalLink url='https://cbg-ethz.github.io/V-pipe/'>V-pipe</ExternalLink>, and search for mutations
        characteristic of several variants of concern. The relative frequency of each signature mutation vs.
        wild type is determined, and all frequencies are combined per day, which provides an estimate of the
        relative prevalence of the variant in the population (see{' '}
        <ExternalLink url='https://doi.org/10.1101/2021.01.08.21249379'>
          doi:10.1101/2021.01.08.21249379
        </ExternalLink>{' '}
        and <ExternalLink url='https://github.com/cbg-ethz/cowwid'>cowwid</ExternalLink> for more details, or
        at the{' '}
        <ExternalLink url='https://bsse.ethz.ch/cbg/research/computational-virology/sarscov2-variants-wastewater-surveillance.html#par_textimage_974930497'>
          bottom of this page for a video presentation
        </ExternalLink>
        ).
      </p>
      <h2>Sampling Sites</h2>
      We obtain samples from the following {locationData.length} wastewater treatment plants:
      <PackedGrid maxColumns={2}>
        {locationData.map(({ location, view }) => (
          <GridCell minWidth={600} key={location}>
            {view}
          </GridCell>
        ))}
      </PackedGrid>
    </div>
  );
};
