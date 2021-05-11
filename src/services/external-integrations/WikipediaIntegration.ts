import { getPangolinLineageIfPure, Integration, IntegrationSelector } from './Integration';

const wikiLinks = new Map([
  ['B.1.1.7', 'https://en.wikipedia.org/wiki/Lineage_B.1.1.7'],
  ['B.1.351', 'https://en.wikipedia.org/wiki/Lineage_B.1.351'],
  ['B.1.526', 'https://en.wikipedia.org/wiki/Lineage_B.1.526'],
  ['B.1.617', 'https://en.wikipedia.org/wiki/Lineage_B.1.617'],
  ['P.1', 'https://en.wikipedia.org/wiki/Lineage_P.1'],
  ['P.3', 'https://en.wikipedia.org/wiki/Lineage_P.3'],
]);

export class WikipediaIntegration implements Integration {
  name = 'Wikipedia';

  isAvailable(selector: IntegrationSelector): boolean {
    const lineage = getPangolinLineageIfPure(selector);
    return !!lineage && wikiLinks.has(lineage);
  }

  open(selector: IntegrationSelector): void {
    if (selector.variant.name) {
      window.open(wikiLinks.get(selector.variant.name));
    }
  }
}
