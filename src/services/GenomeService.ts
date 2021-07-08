import { getPangolinLineages, SamplingStrategy } from './api';

/**
 * This service provides (basic) information about the SARS-CoV-2 genome.
 */
export class GenomeService {
  private static knownPangolinLineagesPromise: Promise<readonly string[]> | undefined = undefined;

  static getKnownPangolinLineages(): Promise<readonly string[]> {
    if (!GenomeService.knownPangolinLineagesPromise) {
      GenomeService.knownPangolinLineagesPromise = getPangolinLineages({
        country: 'World',
        samplingStrategy: SamplingStrategy.AllSamples,
      }).then(pls =>
        pls
          .sort((pl1, pl2) => pl2.count - pl1.count)
          .filter(pl => pl.pangolinLineage !== null)
          .map(pl => pl.pangolinLineage!)
      );
    }
    return GenomeService.knownPangolinLineagesPromise;
  }
}
