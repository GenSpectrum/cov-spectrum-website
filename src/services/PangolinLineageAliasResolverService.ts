import { PangolinLineageAlias } from './api-types';
import { getPangolinLineageAliases } from './api';

export class PangolinLineageAliasResolverService {
  private static aliases: PangolinLineageAlias[] | undefined;

  static async findFullName(pangolinLineage: string): Promise<string | undefined> {
    let aliases = PangolinLineageAliasResolverService.aliases;
    if (aliases === undefined) {
      aliases = await getPangolinLineageAliases();
      PangolinLineageAliasResolverService.aliases = aliases;
    }
    for (let { alias, fullName } of aliases) {
      if (pangolinLineage.startsWith(alias + '.')) {
        return fullName + pangolinLineage.substr(alias.length);
      }
    }
    return undefined;
  }
}
