import { getPangolinLineageIfPure, Integration, IntegrationSelector } from './Integration';

const wikiLinks = new Map([
  ['B.1.1.7', 'https://en.wikipedia.org/wiki/SARS-CoV-2_Alpha_variant'],
  ['B.1.351', 'https://en.wikipedia.org/wiki/SARS-CoV-2_Beta_variant'],
  ['B.1.526', 'https://en.wikipedia.org/wiki/SARS-CoV-2_Iota_variant'],
  ['B.1.617.1', 'https://en.wikipedia.org/wiki/SARS-CoV-2_Kappa_variant'],
  ['B.1.617.2', 'https://en.wikipedia.org/wiki/SARS-CoV-2_Delta_variant'],
  ['P.1', 'https://en.wikipedia.org/wiki/SARS-CoV-2_Gamma_variant'],
  ['P.3', 'https://en.wikipedia.org/wiki/SARS-CoV-2_Theta_variant'],
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
