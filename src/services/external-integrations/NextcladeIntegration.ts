import { Integration } from './Integration';
import { LocationDateVariantSelector } from '../../data/LocationDateVariantSelector';
import { sequenceDataSource } from '../../helpers/sequence-data-source';
import { OrderAndLimitConfig } from '../../data/OrderAndLimitConfig';
import { getLinkToFasta } from '../../data/api-lapis';

export class NextcladeIntegration implements Integration {
  name = 'Nextclade';

  isAvailable(_: LocationDateVariantSelector): boolean {
    return sequenceDataSource === 'open';
  }

  async open(selector: LocationDateVariantSelector) {
    const orderAndLimit: OrderAndLimitConfig = {
      orderBy: 'random',
      limit: 200,
    };
    const linkToFasta = await getLinkToFasta(false, selector, orderAndLimit);
    const nextcladePrefix = 'https://clades.nextstrain.org/?dataset-name=sars-cov-2&input-fasta=';
    const url = `${nextcladePrefix}${encodeURIComponent(linkToFasta)}`;
    window.open(url);
  }
}
