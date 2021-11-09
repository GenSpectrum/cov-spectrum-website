import { Integration } from './Integration';
import { LocationDateVariantSelector } from '../../data/LocationDateVariantSelector';
import { decodeAAMutation } from '../../helpers/aa-mutation';
import { LocationService } from '../LocationService';

export class TaxoniumIntegration implements Integration {
  name: string = 'Taxonium';

  /**
   * This integration is only available for pango lineages and AA mutations
   */
  isAvailable({ variant }: LocationDateVariantSelector): boolean {
    if (!variant) {
      return false;
    }
    const { gisaidClade, nextstrainClade, nucMutations } = variant;
    if (
      gisaidClade ||
      nextstrainClade ||
      (nucMutations && nucMutations.length) ||
      (variant.pangoLineage && variant.pangoLineage.endsWith('*'))
    ) {
      return false;
    }
    return true;
  }

  open(selector: LocationDateVariantSelector): void {
    this._open(selector);
  }

  private async _open({ variant, location }: LocationDateVariantSelector) {
    const baseUrl = 'https://taxonium.org/';
    const params = new URLSearchParams();

    // Some default parameters
    params.set('protoUrl', '/nodelist.pb.gz');
    params.set('blinking', 'false');
    params.set('zoomToSearch', '0');
    params.set(
      'colourBy',
      JSON.stringify({
        variable: 'none',
        colourLines: false,
        gene: 'S', // That is just the default for when the user switches to the AA site coloring
        residue: '681',
      })
    );

    // The variant
    if (!variant) {
      return;
    }
    const { pangoLineage, aaMutations } = variant;
    const searchList = [];
    if (pangoLineage) {
      searchList.push({
        id: Math.random(),
        category: 'lineage',
        value: pangoLineage,
        enabled: true,
        aa_final: 'any',
        min_tips: 1,
        aa_gene: 'S',
        search_for_ids: '',
      });
    }
    if (aaMutations) {
      for (let aaMutation of aaMutations) {
        const decoded = decodeAAMutation(aaMutation);
        searchList.push({
          id: Math.random(),
          category: 'mutation',
          value: '',
          enabled: true,
          aa_final: decoded.mutatedBase ?? 'any',
          min_tips: 1,
          aa_gene: decoded.gene,
          search_for_ids: '',
          aa_pos: decoded.position,
        });
      }
    }
    if (location.country) {
      searchList.push({
        id: 0.123,
        category: 'country',
        value: await LocationService.getGisaidName(location.country),
        enabled: true,
        aa_final: 'Y',
        min_tips: 1,
        aa_gene: 'S',
        search_for_ids: '',
        aa_pos: '501',
      });
    }
    params.set('search', JSON.stringify(searchList));
    window.open(`${baseUrl}?${params.toString()}`);
  }
}
