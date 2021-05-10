import { Integration, IntegrationSelector } from './Integration';

export class OutbreakInfoIntegration implements Integration {
  name = 'outbreak.info';

  isAvailable(selector: IntegrationSelector): boolean {
    // TODO outbreak.info can more! It can also generate reports for mutations and limit to countries
    return (
      selector.variant.mutations.length === 0 &&
      !!selector.variant.name &&
      !selector.variant.name.endsWith('*')
    );
  }

  open(selector: IntegrationSelector): void {
    window.open(`https://outbreak.info/situation-reports?pango=${selector.variant.name}`);
  }
}
