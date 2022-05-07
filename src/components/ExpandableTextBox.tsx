import { useState } from 'react';
import styled from 'styled-components';

type Props = {
  text: string;
  maxChars: number;
  keepNewLine?: boolean;
};

export const ShowMoreOrLessButton = styled.button`
  background: none;
  border: none;
  outline: none;
  font-size: small;
  margin-left: 5px;
`;

export const ExpandableTextBox = ({ text, maxChars, keepNewLine = false }: Props): JSX.Element => {
  const [expanded, setExpanded] = useState<boolean>(false);

  const textElement = <div className={keepNewLine ? 'whitespace-pre-wrap' : ''}>{text}</div>;

  if (text.length <= maxChars) {
    return textElement;
  }

  if (expanded) {
    return (
      <>
        {textElement}
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
