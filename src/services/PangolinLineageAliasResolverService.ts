import { PangolinLineageAlias } from './api-types';
import { getPangolinLineageAliases } from './api';

export class PangolinLineageAliasResolverService {
  private static aliases: PangolinLineageAlias[] | undefined;

  static async findFullName(pangolinLineage: string): Promise<string | undefined> {
    let promise = undefined;
    let aliases = PangolinLineageAliasResolverService.aliases;
    if (aliases === undefined) {
      try {
        aliases = await getPangolinLineageAliases();
        PangolinLineageAliasResolverService.aliases = aliases;

        for (let { alias, fullName } of aliases) {
          if (pangolinLineage.startsWith(alias + '.')) {
            promise = fullName + pangolinLineage.substr(alias.length);
          }
        }
      } catch (error) {
        console.log(error.message);
      }
    }
    return promise;
  }
}
