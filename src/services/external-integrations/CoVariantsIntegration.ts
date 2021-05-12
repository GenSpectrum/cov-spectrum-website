import { getPangolinLineageIfPure, Integration, IntegrationSelector } from './Integration';

const pangolinLineagesMap = new Map([
  ['B.1.177', 'https://covariants.org/variants/20A.EU1'],
  ['B.1.160', 'https://covariants.org/variants/20A.EU2'],
  ['B.1.1.7', 'https://covariants.org/variants/S.501Y.V1'],
  ['B.1.351', 'https://covariants.org/variants/S.501Y.V2'],
  ['P.1', 'https://covariants.org/variants/S.501Y.V3'],
  ['B.1.427', 'https://covariants.org/variants/S.L452R'],
  ['B.1.429', 'https://covariants.org/variants/S.L452R'],
  ['B.1.525', 'https://covariants.org/variants/20A.S.484K'],
  ['B.1.526', 'https://covariants.org/variants/20C.S.484K'],
  ['B.1.617.1', 'https://covariants.org/variants/20A.S.154K'],
  ['B.1.617.2', 'https://covariants.org/variants/20A.S.478K'],
  ['B.1.258', 'https://covariants.org/variants/S.N439K'],
  ['B.1.221', 'https://covariants.org/variants/S.S98F'],
  ['B.1.367', 'https://covariants.org/variants/S.D80Y'],
  ['B.1.1.277', 'https://covariants.org/variants/S.A626S'],
  ['B.1.1.302', 'https://covariants.org/variants/S.V1122L'],
]);

export class CoVariantsIntegration implements Integration {
  name = 'CoVariants';

  isAvailable(selector: IntegrationSelector): boolean {
    const lineage = getPangolinLineageIfPure(selector);
    return !!lineage && pangolinLineagesMap.has(lineage);
  }

  open(selector: IntegrationSelector): void {
    if (selector.variant.name) {
      window.open(pangolinLineagesMap.get(selector.variant.name));
    }
  }
}
