import { Variant } from './api-types';
import { AccountService } from './AccountService';
import { getSampleFastaUrl } from './api';

export class NextcladeService {
  static async showVariantOnNextclade(
    variant: Variant,
    matchPercentage: number,
    country: string | undefined | null
  ) {
    const mutationsString = variant.mutations.join(',');
    let endpoint = getSampleFastaUrl({ mutationsString, matchPercentage, country });
    if (AccountService.isLoggedIn()) {
      const jwt = await AccountService.createTemporaryJwt('/resource/sample-fasta');
      endpoint += '&jwt=' + jwt;
    }
    const nextcladeUrl = 'https://clades.nextstrain.org/?input-fasta=' + encodeURIComponent(endpoint);
    window.open(nextcladeUrl);
  }
}
