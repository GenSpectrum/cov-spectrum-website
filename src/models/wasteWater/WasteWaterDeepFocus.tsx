import React, { useEffect, useState } from 'react';
import { NamedSection } from '../../components/NamedSection';
import { WasteWaterTimeWidget } from './WasteWaterTimeWidget';
import { getData } from './loading';
import { WasteWaterDataset } from './types';
import { WasteWaterHeatMapWidget } from './WasteWaterHeatMapWidget';
import { GridCell, PackedGrid } from '../../components/PackedGrid';
import { ExternalLink } from '../../components/ExternalLink';
import { AccountService } from '../../services/AccountService';

interface Props {
  country: string;
  variantName: string | undefined;
}

export const WASTE_WATER_AVAILABLE_LINEAGES = ['B.1.1.7', 'B.1.351', 'P.1', 'B.1.617*'];

export const WasteWaterDeepFocus = ({ country, variantName }: Props) => {
  const [data, setData] = useState<WasteWaterDataset | undefined>(undefined);

  useEffect(() => {
    if (!variantName) {
      return;
    }
    getData({
      country,
      variantName,
    }).then(d => setData(d));
  }, [country, variantName]);

  const loggedIn = AccountService.isLoggedIn();
  if (!loggedIn) {
    window.location.href = '/login';
  }

  if (country !== 'Switzerland' || !variantName || !WASTE_WATER_AVAILABLE_LINEAGES.includes(variantName)) {
    return <>Nothing to see here.</>;
  }

  return (
    <>
      {data && (
        <>
          {data.data.map(d => (
            <div key={d.location} style={{ marginTop: '20px' }}>
              <h2>{d.location}</h2>
              <PackedGrid maxColumns={2}>
                <GridCell minWidth={500}>
                  <WasteWaterTimeWidget.ShareableComponent
                    data={d.timeseriesSummary}
                    variantName={variantName}
                    country={country}
                    location={d.location}
                    title='Estimated proportion'
                    height={500}
                  />
                </GridCell>
                <GridCell minWidth={800}>
                  <WasteWaterHeatMapWidget.ShareableComponent
                    data={d.mutationOccurrences}
                    variantName={variantName}
                    country={country}
                    location={d.location}
                    title='Occurrences of individual mutations'
                    height={500}
                  />
                </GridCell>
              </PackedGrid>
            </div>
          ))}

          <div style={{ marginTop: '50px' }}>
            <NamedSection title='References'>
              <ul className='list-disc'>
                <li>
                  Jahn, Katharina, et al. "Detection of SARS-CoV-2 variants in Switzerland by genomic analysis
                  of wastewater samples." medRxiv (2021); doi:{' '}
                  <ExternalLink url='https://doi.org/10.1101/2021.01.08.21249379'>
                    10.1101/2021.01.08.21249379
                  </ExternalLink>
                </li>
              </ul>
            </NamedSection>
          </div>
        </>
      )}
    </>
  );
};
