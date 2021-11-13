import { ArticleEntry } from './ArticleEntry';
import { Dataset } from './Dataset';
import { fetchArticles } from './api';

export type ArticleDataset = Dataset<string, ArticleEntry[]>;

export class ArticleData {
  static async fromApi(pangoLineage: string, signal?: AbortSignal): Promise<ArticleDataset> {
    return {
      selector: pangoLineage,
      payload: await fetchArticles(pangoLineage, signal),
    };
  }
}
