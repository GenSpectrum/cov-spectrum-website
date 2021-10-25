import { getPangoLineageIfPure, Integration } from './Integration';
import { LocationDateVariantSelector } from '../../data/LocationDateVariantSelector';

export class PangoLineageIntegration implements Integration {
  name = 'PANGO Lineages';

  isAvailable(selector: LocationDateVariantSelector): boolean {
    return !!getPangoLineageIfPure(selector);
  }

  open(selector: LocationDateVariantSelector): void {
    window.open(`https://cov-lineages.org/lineages/lineage_${selector.variant?.pangoLineage}.html`);
  }
}
