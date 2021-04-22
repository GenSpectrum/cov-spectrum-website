import React, { useEffect, useState } from 'react';
import { NamedSection } from '../../components/NamedSection';
import { WasteWaterTimeWidget } from './WasteWaterTimeWidget';
import { getData } from './loading';
import { WasteWaterDataset } from './types';
import { WasteWaterHeatMapWidget } from './WasteWaterHeatMapWidget';
import { GridCell, PackedGrid } from '../../components/PackedGrid';

interface Props {
  country: string;
  variantName: string | undefined;
}

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

  if (country !== 'Switzerland' || !variantName || variantName !== 'B.1.1.7') {
    return <>Nothing to see here.</>;
  }

  return (
    <>
      {data && (
        <>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean sit amet vehicula urna, sed
            malesuada tortor. Morbi nisi leo, maximus in rutrum id, dapibus vel libero. Donec vestibulum non
            augue ac faucibus. Integer eleifend commodo purus, vel porta tellus consequat ac. Nam nec tempor
            justo, in accumsan nulla. Mauris et augue ante. Nulla facilisis tellus in ante tempor, eu lobortis
            eros posuere. Vestibulum cursus blandit eros vitae hendrerit. Vivamus a ultricies urna, vel tempor
            nisi. Ut interdum at velit sed luctus. Maecenas magna orci, dictum sit amet nulla id, varius
            facilisis lacus. Donec eu gravida nibh, eget consectetur dui. Nunc consequat varius erat vitae
            pretium.
          </p>

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
              <ul>
                <li>
                  Jahn, Katharina, et al. "Detection of SARS-CoV-2 variants in Switzerland by genomic analysis
                  of wastewater samples." medRxiv (2021); doi:{' '}
                  <a href='https://doi.org/10.1101/2021.01.08.21249379' target='_blank' rel='noreferrer'>
                    10.1101/2021.01.08.21249379
                  </a>
                </li>
              </ul>
            </NamedSection>
          </div>
        </>
      )}
    </>
  );
};
