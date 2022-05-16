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
    const baseUrl = 'https://cov2tree.org/';
    const params = new URLSearchParams();

    params.set('zoomToSearch', '0');
    params.set(
      'color',
      JSON.stringify({
        field: 'none',
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
        key: 'search1',
        type: 'meta_pangolin_lineage',
        method: 'text_exact',
        text: pangoLineage,
        new_residue: 'any',
        position: 484,
        min_tips: 0,
        gene: 'S',
      });
    }
    if (aaMutations) {
      for (let aaMutation of aaMutations) {
        const decoded = decodeAAMutation(aaMutation);
        searchList.push({
          key: 'search2' + Math.random(),
          type: 'mutation',
          method: 'mutation',
          text: '',
          new_residue: decoded.mutatedBase ?? 'any',
          position: decoded.position,
          min_tips: 0,
          gene: decoded.gene,
        });
      }
    }
    if (location.country) {
      searchList.push({
        key: 'search3',
        type: 'meta_country',
        method: 'text_exact',
        text: await LocationService.getGisaidName(location.country),
        new_residue: 'any',
        position: 484,
        min_tips: 0,
        gene: 'S',
      });
    }
    params.set('srch', JSON.stringify(searchList));
    params.set('enabled', JSON.stringify(Object.fromEntries(searchList.map(s => [s.key, true]))));
    window.open(`${baseUrl}?${params.toString()}`);
  }
}
