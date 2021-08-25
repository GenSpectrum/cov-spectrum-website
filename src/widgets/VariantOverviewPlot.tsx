import { Country } from '../services/api-types';
import { SamplingStrategy } from '../services/api';

interface Props {
  country: Country;
  samplingStrategy: SamplingStrategy;
}

export const VariantOverviewPlot = ({country, samplingStrategy}: Props) => {

  // Choose the initial set of variants:
  // Load the number of samples of all pango lineages through time.
  

  // How many variants do we want to show at most?

  // Idea 1:
  // 1. Calculate the proportion of the variants in each week
  // 2. Sum up the proportions for each variant
  // 3. Sort by the summed-up proportions and choose the top variants
  // ==> This way, we can maximize the overall covered area with a fixed number of variants without
  //     rollup variants.

  // Idea 2: Can we improve idea 1 by rolling up variants?
  // - If idea 1 is already good enough (e.g., the vast majority of the area is covered throughout time),
  // there is no need to improve.
  // - Do we further want to try to keep the number of "visible" variants small?



  return <></>;
};
