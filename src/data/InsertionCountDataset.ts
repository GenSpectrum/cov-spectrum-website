import { Dataset } from './Dataset';
import { InsertionCountEntry } from './InsertionCountEntry';
import { fetchInsertionCounts } from './api-lapis';
import { LocationDateVariantSelector } from './LocationDateVariantSelector';
import { SequenceType } from './SequenceType';
import { LapisSelector } from './LapisSelector';

export type InsertionCountDataset = Dataset<LocationDateVariantSelector, InsertionCountEntry[]>;

export class InsertionCountData {
  static async fromApi(
    selector: LapisSelector,
    sequenceType: SequenceType,
    signal?: AbortSignal
  ): Promise<InsertionCountDataset> {
    return {
      selector,
      payload: await fetchInsertionCounts(selector, sequenceType, signal),
    };
  }
}
