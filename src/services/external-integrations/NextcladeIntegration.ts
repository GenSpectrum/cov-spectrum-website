import { AccountService } from '../AccountService';
import { getSampleFastaUrl } from '../api';
import { Integration, IntegrationSelector } from './Integration';

export class NextcladeIntegration implements Integration {
  name = 'Nextclade';

  isAvailable({ country }: IntegrationSelector): boolean {
    return AccountService.isLoggedIn() || country === 'Switzerland';
  }

  async open({ variant, matchPercentage, country, samplingStrategy }: IntegrationSelector) {
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
