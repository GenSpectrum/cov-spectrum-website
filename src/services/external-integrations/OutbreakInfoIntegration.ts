import { getPangolinLineageIfPure, Integration, IntegrationSelector } from './Integration';

export class OutbreakInfoIntegration implements Integration {
  name = 'outbreak.info';

  isAvailable(selector: IntegrationSelector): boolean {
    // TODO outbreak.info can more! It can also generate reports for mutations and limit to countries
    return !!getPangolinLineageIfPure(selector);
  }

  open(selector: IntegrationSelector): void {
    window.open(`https://outbreak.info/situation-reports?pango=${selector.variant.name}`);
  }
}
