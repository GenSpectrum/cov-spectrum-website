import React, { useEffect, useState } from 'react';
import { useMatch } from 'react-router-dom';
import { WasteWaterDataset } from '../types';
import { filter, getData } from '../loading';
import { GridCell, PackedGrid } from '../../../components/PackedGrid';
import { WasteWaterTimeWidget } from '../WasteWaterTimeWidget';
import { WasteWaterHeatMapWidget } from '../WasteWaterHeatMapWidget';
import Loader from '../../../components/Loader';
import { sortBy } from '../../../helpers/lodash_alternatives';

export const WasteWaterLocationPage = () => {
  const routeMatch = useMatch(`/story/wastewater-in-switzerland/location/:location`);
  const location = routeMatch?.params.location;
  const country = 'Switzerland';

  const [wasteWaterData, setWasteWaterData] = useState<WasteWaterDataset | undefined>(undefined);
  useEffect(() => {
    getData({ country }).then(dataset => dataset && setWasteWaterData(filter(dataset, undefined, location)));
  }, [location]);

  if (wasteWaterData === undefined || location === undefined) {
    return <Loader />;
  }

  return (
    <div className='px-4 md:px-8 mt-4'>
      <a href='..'>&#60; Return</a>
      <h1 className='mt-0'>Wastewater in Switzerland - {location}</h1>

      {wasteWaterData
        .concat()
        .sort(sortBy('variantName'))
        .map(({ variantName, data }) => (
          <div key={variantName} style={{ marginTop: '20px' }}>
            <h2>{variantName}</h2>
            <PackedGrid maxColumns={2}>
              <GridCell minWidth={500}>
                <WasteWaterTimeWidget.ShareableComponent
                  data={data.timeseriesSummary}
                  variantName={variantName}
                  country={country}
                  location={location}
                  title='Estimated proportion'
                  height={500}
                />
              </GridCell>
              {data.mutationOccurrences && (
                <GridCell minWidth={800}>
                  <WasteWaterHeatMapWidget.ShareableComponent
                    data={data.mutationOccurrences}
                    variantName={variantName}
                    country={country}
                    location={location}
                    title='Occurrences of individual mutations'
                    height={500}
                  />
                </GridCell>
              )}
            </PackedGrid>
          </div>
        ))}
    </div>
  );
};
