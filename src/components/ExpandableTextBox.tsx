import { useState } from 'react';
import styled from 'styled-components';

type Props = {
  text: string;
  maxChars: number;
};

export const ShowMoreOrLessButton = styled.button`
  background: none;
  border: none;
  outline: none;
  font-size: small;
  margin-left: 5px;
`;

export const ExpandableTextBox = ({ text, maxChars }: Props): JSX.Element => {
  const [expanded, setExpanded] = useState<boolean>(false);

  if (text.length <= maxChars) {
    return <>{text}</>;
  }

  if (expanded) {
    return (
      <>
        {text}
        <ShowMoreOrLessButton onClick={() => setExpanded(false)}>(show less)</ShowMoreOrLessButton>
      </>
    );
  }

  const short = text.substring(0, maxChars);
  return (
    <>
      {short}...
      <ShowMoreOrLessButton onClick={() => setExpanded(true)}>(show more)</ShowMoreOrLessButton>
    </>
  );
};
