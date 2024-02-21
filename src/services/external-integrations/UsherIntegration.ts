import { Integration } from './Integration';
import { getLinkToListOfPrimaryKeys } from '../../data/api-lapis';
import { sequenceDataSource } from '../../helpers/sequence-data-source';
import { OrderAndLimitConfig } from '../../data/OrderAndLimitConfig';
import { LapisSelector } from '../../data/LapisSelector';

const usherUrl =
  'https://genome.ucsc.edu/cgi-bin/hgPhyloPlace?db=wuhCor1&phyloPlaceTree=hgPhyloPlaceData/wuhCor1' +
  '/public.plusGisaid.latest.masked.pb&subtreeSize=5000&remoteFile=';
// TODO(#927) bring back random order
const defaultOrderAndLimit: OrderAndLimitConfig = { /* orderBy: 'random',*/ limit: 400 };

export class UsherIntegration implements Integration {
  name = 'UShER';

  isAvailable(_: LapisSelector): boolean {
    return true;
  }

  open(selector: LapisSelector): void {
    (sequenceDataSource === 'gisaid'
      ? getLinkToListOfPrimaryKeys('gisaidEpiIsl', selector, defaultOrderAndLimit)
      : getLinkToListOfPrimaryKeys('strain', selector, defaultOrderAndLimit)
    ).then(url => {
      window.open(usherUrl + encodeURIComponent(url));
    });
  }
}
