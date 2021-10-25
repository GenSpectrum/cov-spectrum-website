import { PangoLineageAlias } from '../data/PangoLineageAlias';
import { fetchPangoLineageAliases } from '../data/api';

export class PangoLineageAliasResolverService {
  private static aliases: Promise<PangoLineageAlias[]> = PangoLineageAliasResolverService.init();

  private static init() {
    return fetchPangoLineageAliases();
  }

  static async findFullName(pangoLineage: string): Promise<string | undefined> {
    const aliases = await PangoLineageAliasResolverService.aliases;
    pangoLineage = pangoLineage.toUpperCase();
    for (let { alias, fullName } of aliases) {
      if (pangoLineage.startsWith(alias + '.')) {
        return fullName + pangoLineage.substr(alias.length);
      }
    }
    return undefined;
  }
}
