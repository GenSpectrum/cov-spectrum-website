import { Integration, IntegrationSelector } from './Integration';

export class PangoLineageIntegration implements Integration {
  name = 'PANGO Lineages';

  isAvailable(selector: IntegrationSelector): boolean {
    return (
      selector.variant.mutations.length === 0 &&
      !!selector.variant.name &&
      !selector.variant.name.endsWith('*')
    );
  }

  open(selector: IntegrationSelector): void {
    window.open(`https://cov-lineages.org/lineages/lineage_${selector.variant.name}.html`);
  }
}
