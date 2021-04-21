import { Variant } from './api-types';
import { AccountService } from './AccountService';
import { getSampleFastaUrl, LiteralSamplingStrategy } from './api';

export class NextcladeService {
  static async showVariantOnNextclade({
    variant,
    matchPercentage,
    country,
    samplingStrategy,
  }: {
    variant: Variant;
    matchPercentage: number;
    country: string | undefined | null;
    samplingStrategy: LiteralSamplingStrategy;
  }) {
    const mutationsString = variant.mutations.join(',');
    let endpoint = getSampleFastaUrl({
      pangolinLineage: variant.name,
      mutationsString,
      matchPercentage,
      country,
      samplingStrategy,
    });
    if (AccountService.isLoggedIn()) {
      const jwt = await AccountService.createTemporaryJwt('/resource/sample-fasta');
      endpoint += '&jwt=' + jwt;
    }
    const nextcladeUrl = 'https://clades.nextstrain.org/?input-fasta=' + encodeURIComponent(endpoint);
    window.open(nextcladeUrl);
  }
}
