import { getPangolinLineageIfPure, Integration, IntegrationSelector } from './Integration';

export class PangoLineageIntegration implements Integration {
  name = 'PANGO Lineages';

  isAvailable(selector: IntegrationSelector): boolean {
    return !!getPangolinLineageIfPure(selector);
  }

  open(selector: IntegrationSelector): void {
    window.open(`https://cov-lineages.org/lineages/lineage_${selector.variant.name}.html`);
  }
}
