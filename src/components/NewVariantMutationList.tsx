import React, { useState } from 'react';
import { sortListByMutation } from '../helpers/mutation-list';
import styled from 'styled-components';

interface Props {
  mutations: Array<{ mutation: string; uniquenessScore: number }>;
}

const ShowMoreOrLessButton = styled.button`
  background: none;
  border: none;
  outline: none;
  font-size: small;
  margin-left: 5px;
`;

const ImportantMutation = styled.span`
  font-weight: bold;
`;

const OtherMutation = styled.span``;

// We consider mutations with a uniquenessScore of at least the following value as characteristic/important for a
// variant.
const uniquenessScoreImportanceThreshold = 0.5;

/**
 * The function splits the list of mutations based on the uniqueness score and returns two list. The short list contains
 * at least one but no more than five mutations and the full list contains all.
 */
function splitMutationList(
  mutations: Array<{ mutation: string; uniquenessScore: number }>
): {
  short: Array<{ mutation: string; uniquenessScore: number }>;
  full: Array<{ mutation: string; uniquenessScore: number }>;
} {
  return {
    short: mutations.sort((a, b) => b.uniquenessScore - a.uniquenessScore).slice(0, 5),
    full: mutations,
  };
}

function sortAndFormatMutationList(mutations: Array<{ mutation: string; uniquenessScore: number }>) {
  mutations = sortListByMutation(mutations, x => x.mutation);
  const formatted = mutations
    .map(({ mutation, uniquenessScore }) =>
      uniquenessScore >= uniquenessScoreImportanceThreshold ? (
        <ImportantMutation key={mutation}>{mutation}</ImportantMutation>
      ) : (
        <OtherMutation key={mutation}>{mutation}</OtherMutation>
      )
    )
    .flatMap((v, i) => (i === 0 ? [v] : [', ', v]));
  return <>{formatted}</>;
}

export const NewVariantMutationList = ({ mutations }: Props) => {
  const [showMore, setShowMore] = useState(false);

  const { short, full } = splitMutationList(mutations);
  if (short.length === full.length) {
    return sortAndFormatMutationList(short);
  }

  if (!showMore) {
    return (
      <>
        {sortAndFormatMutationList(short)}, ...{' '}
        <ShowMoreOrLessButton onClick={() => setShowMore(true)}>(show more)</ShowMoreOrLessButton>
      </>
    );
  }

  return (
    <>
      {sortAndFormatMutationList(full)}
      <ShowMoreOrLessButton onClick={() => setShowMore(false)}>(show less)</ShowMoreOrLessButton>
    </>
  );
};
