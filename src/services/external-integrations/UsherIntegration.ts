import { Integration } from './Integration';
import { LocationDateVariantSelector } from '../../data/LocationDateVariantSelector';
import { getLinkToGisaidEpiIsl, getLinkToStrainNames } from '../../data/api-lapis';
import { sequenceDataSource } from '../../helpers/sequence-data-source';

const usherUrl =
  'https://genome.ucsc.edu/cgi-bin/hgPhyloPlace?db=wuhCor1&phyloPlaceTree=hgPhyloPlaceData/wuhCor1' +
  '/public.plusGisaid.latest.masked.pb&subtreeSize=1000&remoteFile=';

export class UsherIntegration implements Integration {
  name = 'UShER';

  isAvailable(_: LocationDateVariantSelector): boolean {
    return true;
  }

  open(selector: LocationDateVariantSelector): void {
    (sequenceDataSource === 'gisaid' ? getLinkToGisaidEpiIsl(selector) : getLinkToStrainNames(selector)).then(
      url => {
        window.open(usherUrl + encodeURIComponent(url));
      }
    );
  }
}
