import { useQuery } from 'react-query';
import { fetchPangoLineageAliases } from '../data/api';
import { PangoLineageAlias } from '../data/PangoLineageAlias';

export function usePangoLineageFullName(pangoLineage: string) {
  const { data } = useQuery('PangoLineageAliases', () => fetchPangoLineageAliases());

  if (data === undefined) {
    return undefined;
  }

  pangoLineage = pangoLineage.toUpperCase();
  const pangoLineagePrefix = pangoLineage.split('.')[0];

  const prefixFullName = data.find(pangoLineage => {
    return pangoLineage.alias === pangoLineagePrefix;
  })?.fullName;

  if (prefixFullName === undefined) {
    return undefined;
  }

  return prefixFullName + pangoLineage.substring(pangoLineagePrefix.length);
}

export function usePangoLineageWithAlias(pangoLineage: string) {
  const { data } = useQuery('PangoLineageAliases', () => fetchPangoLineageAliases());

  if (data === undefined) {
    return pangoLineage;
  }

  const alias: PangoLineageAlias | undefined = data
    .filter(lineageAlias => pangoLineage.includes(lineageAlias.fullName + '.'))
    .sort((a, b) => b.fullName.length - a.fullName.length)[0];
  if (!alias) {
    return pangoLineage;
  }
  return pangoLineage.replace(alias.fullName, alias.alias);
}
