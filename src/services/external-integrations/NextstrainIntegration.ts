import { Integration, IntegrationSelector } from './Integration';
import { decodeMutation, normalizeDecodedMutation } from '../../helpers/mutation';

function formatMutation(mutation: string): string {
  const { gene, position, mutatedBase } = normalizeDecodedMutation(decodeMutation(mutation));
  return gene + '.' + position + mutatedBase;
}

export class NextstrainIntegration implements Integration {
  name = 'Nextstrain';

  isAvailable(selector: IntegrationSelector): boolean {
    // TODO Support other Nextstrain builds as well
    if (selector.country !== 'Switzerland') {
      return false;
    }
    // Nextstrain does not seem to support mutations that do not define the mutated base.
    const mutatedBasePresent = selector.variant.mutations.every(x => !!decodeMutation(x).mutatedBase);
    if (!mutatedBasePresent) {
      return false;
    }
    return true;
  }

  open(selector: IntegrationSelector): void {
    const params = new URLSearchParams();
    params.set('f_country', 'Switzerland');
    if (selector.variant.name) {
      params.set('f_pango_lineage', selector.variant.name);
    }
    if (selector.variant.mutations.length > 0) {
      params.set('gt', selector.variant.mutations.map(formatMutation).join(','));
    }
    window.open(`https://nextstrain.org/groups/swiss/ncov/switzerland?${params.toString()}`);
  }
}
