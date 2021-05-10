import { Integration, IntegrationSelector } from './Integration';

export class NextstrainIntegration implements Integration {
  name = 'Nextstrain';

  isAvailable(selector: IntegrationSelector): boolean {
    // TODO Nextstrain is available for so much more...
    return (
      selector.variant.mutations.length === 0 &&
      !!selector.variant.name &&
      !selector.variant.name.endsWith('*') &&
      selector.country === 'Switzerland'
    );
  }

  open(selector: IntegrationSelector): void {
    window.open(
      `https://nextstrain.org/groups/swiss/ncov/switzerland?f_country=Switzerland&f_pango_lineage=${selector.variant.name}`
    );
  }
}
