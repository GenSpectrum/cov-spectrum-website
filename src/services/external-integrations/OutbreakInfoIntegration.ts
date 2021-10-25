import { getPangoLineageIfPure, Integration } from './Integration';
import { LocationDateVariantSelector } from '../../data/LocationDateVariantSelector';

export class OutbreakInfoIntegration implements Integration {
  name = 'outbreak.info';

  isAvailable(selector: LocationDateVariantSelector): boolean {
    // TODO outbreak.info can more! It can also generate reports for mutations and limit to countries
    return !!getPangoLineageIfPure(selector);
  }

  open(selector: LocationDateVariantSelector): void {
    window.open(`https://outbreak.info/situation-reports?pango=${selector.variant?.pangoLineage}`);
  }
}
