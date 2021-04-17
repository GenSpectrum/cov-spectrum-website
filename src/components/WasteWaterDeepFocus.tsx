import { WasteWaterTimeHeatMapChart } from '../charts/WasteWaterTimeHeatMapChart';
import React from 'react';
import { NamedCard } from './NamedCard';
import { NamedSection } from './NamedSection';
import { WasteWaterTimeChart } from '../charts/WasteWaterTimeChart';

export const WasteWaterDeepFocus = () => {
  return (
    <>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean sit amet vehicula urna, sed malesuada
        tortor. Morbi nisi leo, maximus in rutrum id, dapibus vel libero. Donec vestibulum non augue ac
        faucibus. Integer eleifend commodo purus, vel porta tellus consequat ac. Nam nec tempor justo, in
        accumsan nulla. Mauris et augue ante. Nulla facilisis tellus in ante tempor, eu lobortis eros posuere.
        Vestibulum cursus blandit eros vitae hendrerit. Vivamus a ultricies urna, vel tempor nisi. Ut interdum
        at velit sed luctus. Maecenas magna orci, dictum sit amet nulla id, varius facilisis lacus. Donec eu
        gravida nibh, eget consectetur dui. Nunc consequat varius erat vitae pretium.
      </p>

      <NamedCard title='Zurich'>
        <div style={{ display: 'flex' }}>
          <div style={{ height: '400px', width: '600px', marginRight: '50px' }}>
            <WasteWaterTimeChart />
          </div>
          <div style={{ height: '400px', maxWidth: '900px', flexGrow: 1 }}>
            <WasteWaterTimeHeatMapChart />
          </div>
        </div>
      </NamedCard>

      <NamedCard title='Lausanne'>
        <div style={{ display: 'flex' }}>
          <div style={{ height: '400px', width: '600px', marginRight: '50px' }}>
            <WasteWaterTimeChart />
          </div>
          <div style={{ height: '400px', maxWidth: '900px', flexGrow: 1 }}>
            <WasteWaterTimeHeatMapChart />
          </div>
        </div>
      </NamedCard>

      <NamedCard title='Geneva'>
        <div style={{ display: 'flex' }}>
          <div style={{ height: '400px', width: '600px', marginRight: '50px' }}>
            <WasteWaterTimeChart />
          </div>
          <div style={{ height: '400px', maxWidth: '900px', flexGrow: 1 }}>
            <WasteWaterTimeHeatMapChart />
          </div>
        </div>
      </NamedCard>

      <div style={{ marginTop: '50px' }}>
        <NamedSection title='References'>
          <ul>
            <li>
              Jahn, Katharina, et al. "Detection of SARS-CoV-2 variants in Switzerland by genomic analysis of
              wastewater samples." medRxiv (2021); doi:{' '}
              <a href='https://doi.org/10.1101/2021.01.08.21249379' target='_blank' rel='noreferrer'>
                10.1101/2021.01.08.21249379
              </a>
            </li>
          </ul>
        </NamedSection>
      </div>
    </>
  );
};
