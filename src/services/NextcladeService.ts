import { Variant } from './api-types';
import { AccountService } from './AccountService';
import { getSampleFastaUrl } from './api';

export class NextcladeService {
  static async showVariantOnNextclade(
    variant: Variant,
    matchPercentage: number,
    country: string | undefined | null
  ) {
    if (!AccountService.isLoggedIn()) {
      throw new Error('Sequence data can currently only be obtained by logged-in users.');
    }
    const jwt = await AccountService.createTemporaryJwt('/resource/sample-fasta');
    const mutationsString = variant.mutations.join(',');
    let endpoint = getSampleFastaUrl(mutationsString, matchPercentage, country);
    endpoint += '&jwt=' + jwt;
    const nextcladeUrl = 'https://clades.nextstrain.org/?input-fasta=' + encodeURIComponent(endpoint);
    window.open(nextcladeUrl);
  }
}
