import { Althaus2021GrowthParameterPanel } from './Althaus2021GrowthParameterPanel';
import { LocationSelector } from '../../data/LocationSelector';
import { VariantSelector } from '../../data/VariantSelector';
import { SamplingStrategy } from '../../data/SamplingStrategy';
import { DateRangeSelector } from '../../data/DateRangeSelector';
import { ExpandableTextBox } from '../../components/ExpandableTextBox';
import { Althaus2021GrowthParameters } from './althaus2021Growth-types';

export type ContainerProps = {
  locationSelector: LocationSelector;
  dateRangeSelector: DateRangeSelector;
  variantSelector: VariantSelector;
  samplingStrategy: SamplingStrategy;
};

export const Althaus2021GrowthContainer = ({
  locationSelector,
  dateRangeSelector,
  variantSelector,
  samplingStrategy,
}: ContainerProps) => {
  const defaultParams: Althaus2021GrowthParameters = {
    transmissibilityIncrease: 0.6,
    durationIncrease: 0,
    immuneEvasion: 0,
    susceptiblesProportion: 0.6,
    reproductionNumberWildtype: 1,
    generationTime: 5.4,
  };

  return (
    <>
      <div className='mb-6'>
        <ExpandableTextBox
          text='
        This is a long description.
      '
          maxChars={60}
        />
      </div>
      <Althaus2021GrowthParameterPanel
        defaultParams={defaultParams}
        setParams={params => console.log('new params', params)}
      />
    </>
  );
};
