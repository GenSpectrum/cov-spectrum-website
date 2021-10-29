import { Dataset } from './Dataset';
import { MutationProportionEntry } from './MutationProportionEntry';
import { fetchMutationProportions } from './api-lapis';
import { LocationDateVariantSelector } from './LocationDateVariantSelector';
import { SequenceType } from './SequenceType';

export class MutationProportionDataset
  implements Dataset<LocationDateVariantSelector, MutationProportionEntry[]> {
  constructor(private selector: LocationDateVariantSelector, private payload: MutationProportionEntry[]) {}

  getSelector() {
    return this.selector;
  }

  getPayload(): MutationProportionEntry[] {
    return this.payload;
  }

  static async fromApi(
    selector: LocationDateVariantSelector,
    sequenceType: SequenceType,
    signal?: AbortSignal
  ) {
    return new MutationProportionDataset(
      selector,
      await fetchMutationProportions(selector, sequenceType, signal)
    );
  }
}
