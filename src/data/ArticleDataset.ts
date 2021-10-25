import { ArticleEntry } from './ArticleEntry';
import { Dataset } from './Dataset';
import { fetchArticles } from './api';

export class ArticleDataset implements Dataset<string, ArticleEntry[]> {
  constructor(private selector: string, private payload: ArticleEntry[]) {}

  getPayload(): ArticleEntry[] {
    return this.payload;
  }

  getSelector(): string {
    return this.selector;
  }

  static async fromApi(pangoLineage: string, signal?: AbortSignal) {
    return new ArticleDataset(pangoLineage, await fetchArticles(pangoLineage, signal));
  }
}
