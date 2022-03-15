import { Dataset } from './Dataset';
import { MutationProportionEntry } from './MutationProportionEntry';
import { fetchMutationProportions } from './api-lapis';
import { LocationDateVariantSelector } from './LocationDateVariantSelector';
import { SequenceType } from './SequenceType';

export type MutationProportionDataset = Dataset<LocationDateVariantSelector, MutationProportionEntry[]>;

export class MutationProportionData {
  static async fromApi(
    selector: LocationDateVariantSelector,
    sequenceType: SequenceType,
    signal?: AbortSignal
  ): Promise<MutationProportionDataset> {
    //console.log()
    return {
      selector,
      payload: await fetchMutationProportions(selector, sequenceType, signal),
    };
  }
}
