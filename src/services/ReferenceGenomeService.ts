import { ReferenceGenomeInfo } from '../data/ReferenceGenomeInfo';
import { fetchReferenceGenomeInfo } from '../data/api';

export class ReferenceGenomeService {
  private static data: Promise<ReferenceGenomeInfo> = ReferenceGenomeService.init();

  private static async init() {
    return fetchReferenceGenomeInfo();
  }

  /**
   * Returns an amino acid encoded as <gene>:<position>. E.g., "S:501"
   */
  static async getAAOfNuc(nucPosition: number): Promise<string | undefined> {
    const data = await ReferenceGenomeService.data;
    for (let { name, startPosition, endPosition } of data.genes) {
      if (nucPosition >= startPosition && nucPosition <= endPosition) {
        const positionInGene = Math.floor((nucPosition - startPosition) / 3) + 1;
        return `${name}:${positionInGene}`;
      }
    }
    return undefined;
  }
}
