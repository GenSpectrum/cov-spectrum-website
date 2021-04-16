import { TimeHeatMapChart } from '../charts/TimeHeatMapChart';
import React from 'react';
import { NamedCard } from './NamedCard';

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
        <div style={{ height: '400px', maxWidth: '900px' }}>
          <TimeHeatMapChart />
        </div>
      </NamedCard>

      <NamedCard title='Lausanne'>
        <div style={{ height: '400px', maxWidth: '900px' }}>
          <TimeHeatMapChart />
        </div>
      </NamedCard>

      <NamedCard title='Geneva'>
        <div style={{ height: '400px', maxWidth: '900px' }}>
          <TimeHeatMapChart />
        </div>
      </NamedCard>
    </>
  );
};
