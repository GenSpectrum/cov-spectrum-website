import { Dataset } from './Dataset';
import { MutationProportionEntry } from './MutationProportionEntry';
import { fetchMutationProportions } from './api-lapis';
import { LocationDateVariantSelector } from './LocationDateVariantSelector';
import { SequenceType } from './SequenceType';
import { LapisSelector } from './LapisSelector';

export type MutationProportionDataset = Dataset<LocationDateVariantSelector, MutationProportionEntry[]>;

export class MutationProportionData {
  static async fromApi(
    selector: LapisSelector,
    sequenceType: SequenceType,
    signal?: AbortSignal,
    minProportion?: number
  ): Promise<MutationProportionDataset> {
    return {
      selector,
      payload: await fetchMutationProportions(selector, sequenceType, signal, minProportion),
    };
  }
}
