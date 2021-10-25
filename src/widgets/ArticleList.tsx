import React, { useMemo, useState } from 'react';
import Loader from '../components/Loader';
import styled from 'styled-components';
import { ExternalLink } from '../components/ExternalLink';
import { Pagination, Form } from 'react-bootstrap';
import { createBootstrapPaginationControl } from '../helpers/bootstrap-pagination';
import { ArticleDataset } from '../data/ArticleDataset';

const ENTRIES_PER_PAGE = 10;

export type ArticleListProps = {
  articleDataset: ArticleDataset;
};

const TopPanel = styled.div`
  display: flex;
  margin-bottom: 10px;
  align-items: center;
  justify-content: space-between;
`;

const InfoText = styled.div`
  font-size: 0.9rem;
`;

const SearchField = styled.div`
  width: 300px;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
`;

const Entry = styled.div`
  margin-bottom: 10px;
`;

const EntryTitle = styled.div``;

const EntryMetadata = styled.div`
  display: flex;
  font-size: 0.9rem;
`;

const EntryMetadataValue = styled.div`
  margin-left: 10px;
  margin-right: 10px;
`;

function formatAuthorList(authors: string[]): string {
  if (authors.length === 0) {
    return '-';
  } else if (authors.length === 1) {
    return authors[0];
  } else {
    return authors[0] + ' et al.';
  }
}

export const ArticleList = ({ articleDataset }: ArticleListProps) => {
  const [page, setPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const articles = articleDataset.getPayload();

  let filteredArticles = useMemo(() => {
    if (!articles) {
      return undefined;
    }
    let filtered = articles;
    if (searchQuery.length > 0) {
      filtered = filtered.filter(a => {
        const query = searchQuery.toLowerCase();
        return (
          a.title?.toLowerCase().includes(query) ||
          a.abstractText?.toLowerCase().includes(query) ||
          a.authors?.some(a => a.toLowerCase().includes(query))
        );
      });
    }
    return filtered;
  }, [articles, searchQuery]);

  if (!articles || !filteredArticles) {
    return <Loader />;
  }

  const paginationControl = createBootstrapPaginationControl(
    filteredArticles.length,
    ENTRIES_PER_PAGE,
    page,
    setPage
  );

  const paginatedArticles = filteredArticles.slice(ENTRIES_PER_PAGE * (page - 1), ENTRIES_PER_PAGE * page);

  return (
    <>
      <TopPanel>
        <InfoText>Found {articles.length} articles on medRxiv and bioRxiv</InfoText>
        <SearchField>
          <Form.Control
            placeholder='Search article'
            size='sm'
            onChange={e => setSearchQuery(e.target.value)}
          />
        </SearchField>
      </TopPanel>
      <List>
        {paginatedArticles.map(article => (
          <Entry key={article.doi}>
            <EntryTitle>
              <ExternalLink url={'https://doi.org/' + (article.published || article.doi)}>
                {article.title}
              </ExternalLink>
            </EntryTitle>
            <EntryMetadata>
              <EntryMetadataValue>{formatAuthorList(article.authors ?? [])}</EntryMetadataValue>-{' '}
              <EntryMetadataValue>{article.date?.string}</EntryMetadataValue>-{' '}
              <EntryMetadataValue>{article.category ?? ''}</EntryMetadataValue>
              {article.published ? (
                <>
                  - <EntryMetadataValue>published</EntryMetadataValue>
                </>
              ) : (
                <></>
              )}
            </EntryMetadata>
          </Entry>
        ))}
      </List>
      <Pagination size='sm'>{paginationControl.elements}</Pagination>
    </>
  );
};
