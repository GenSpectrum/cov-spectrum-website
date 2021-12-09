import React, { useEffect, useState } from 'react';
import { NamedSection } from '../../components/NamedSection';
import { WasteWaterTimeWidget } from './WasteWaterTimeWidget';
import { filter, getData } from './loading';
import { WasteWaterDataset } from './types';
import { WasteWaterHeatMapWidget } from './WasteWaterHeatMapWidget';
import { GridCell, PackedGrid } from '../../components/PackedGrid';
import { ExternalLink } from '../../components/ExternalLink';
import Loader from '../../components/Loader';
import { Utils } from '../../services/Utils';

interface Props {
  country: string;
  variantName: string | undefined;
}

export const WASTE_WATER_AVAILABLE_LINEAGES = [
  'B.1.1.7',
  'B.1.351',
  'P.1',
  'B.1.617.2',
  'B.1.617.1',
  'B.1.617.3',
  'C.36.3',
  'B.1.1.529',
];

export const WasteWaterDeepFocus = ({ country, variantName }: Props) => {
  const [data, setData] = useState<WasteWaterDataset | undefined>(undefined);

  useEffect(() => {
    if (country !== 'Switzerland' || !variantName || !WASTE_WATER_AVAILABLE_LINEAGES.includes(variantName)) {
      return;
    }
    getData({
      country,
    }).then(dataset => dataset && setData(filter(dataset, variantName)));
  }, [country, variantName]);

  if (country !== 'Switzerland' || !variantName || !WASTE_WATER_AVAILABLE_LINEAGES.includes(variantName)) {
    return <>Nothing to see here.</>;
  }

  if (!data) {
    return <Loader />;
  }

  return (
    <>
      {[...Utils.groupBy(data, d => d.location).entries()].map(([location, entry]) => (
        <div key={location} style={{ marginTop: '20px' }}>
          <h2>{location}</h2>
          <PackedGrid maxColumns={2}>
            <GridCell minWidth={500}>
              <WasteWaterTimeWidget.ShareableComponent
                data={entry[0].data.timeseriesSummary}
                variantName={variantName}
                country={country}
                location={location}
                title='Estimated proportion'
                height={500}
              />
            </GridCell>
            {entry[0].data.mutationOccurrences && (
              <GridCell minWidth={800}>
                <WasteWaterHeatMapWidget.ShareableComponent
                  data={entry[0].data.mutationOccurrences}
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

      <div style={{ marginTop: '50px' }}>
        <NamedSection title='References'>
          <ul className='list-disc'>
            <li>
              Jahn, Katharina, et al. "Detection of SARS-CoV-2 variants in Switzerland by genomic analysis of
              wastewater samples." medRxiv (2021); doi:{' '}
              <ExternalLink url='https://doi.org/10.1101/2021.01.08.21249379'>
                10.1101/2021.01.08.21249379
              </ExternalLink>
            </li>
            <li>
              Project page:{' '}
              <ExternalLink url='https://bsse.ethz.ch/cbg/research/computational-virology/sarscov2-variants-wastewater-surveillance.html' />
            </li>
          </ul>
        </NamedSection>
      </div>
    </>
  );
};
