import { Widget } from './Widget';
import { AsyncZodQueryEncoder } from '../helpers/query-encoder';
import * as zod from 'zod';
import { ArticleList, ArticleListProps } from './ArticleList';
import { ArticleData } from '../data/ArticleDataset';

export const ArticleListWidget = new Widget(
  new AsyncZodQueryEncoder(
    zod.object({
      pangoLineage: zod.string(),
    }),
    async (decoded: ArticleListProps) => ({ pangoLineage: decoded.articleDataset.selector }),
    async (encoded, _) => ({
      articleDataset: await ArticleData.fromApi(encoded.pangoLineage),
    })
  ),
  ArticleList,
  'ArticleList'
);
