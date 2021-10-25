import { globalDateCache, UnifiedDay } from '../helpers/date-cache';

export type ArticleEntry = {
  doi: string | null;
  title: string | null;
  authors: string[] | null;
  date: UnifiedDay | null;
  category: string | null;
  published: string | null;
  server: string | null;
  abstractText: string | null;
};

export type ArticleEntryRaw = Omit<ArticleEntry, 'date'> & {
  date: string | null;
};

export function parseArticleEntry(raw: ArticleEntryRaw): ArticleEntry {
  return {
    ...raw,
    date: raw.date != null ? globalDateCache.getDay(raw.date) : null,
  };
}
