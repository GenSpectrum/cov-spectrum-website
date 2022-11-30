import { PangoLineageAlias } from '../data/PangoLineageAlias';
import { fetchPangoLineageAliases } from '../data/api';

export class PangoLineageAliasResolverService {
  private static aliases: Promise<PangoLineageAlias[]> = PangoLineageAliasResolverService.init();
  private static aliasesSync: PangoLineageAlias[] | undefined = undefined;

  private static init() {
    return fetchPangoLineageAliases().then(x => (PangoLineageAliasResolverService.aliasesSync = x));
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

  static findAliasUnsafeSync(fullName: string): string {
    if (!PangoLineageAliasResolverService.aliasesSync) {
      return fullName;
    }
    const alias: PangoLineageAlias | undefined = PangoLineageAliasResolverService.aliasesSync
      .filter(a => fullName.includes(a.fullName + '.'))
      .sort((a, b) => b.fullName.length - a.fullName.length)[0];
    if (!alias) {
      return fullName;
    }
    return fullName.replace(alias.fullName, alias.alias);
  }
}
