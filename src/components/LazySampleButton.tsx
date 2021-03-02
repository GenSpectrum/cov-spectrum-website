import React from 'react';
import { useHistory } from 'react-router-dom';
import { Button, ButtonProps } from 'react-bootstrap';
import { getSamplePageLink, SamplePageQuery } from '../pages/SamplePage';

interface Props extends ButtonProps {
  query: SamplePageQuery;
}

export const LazySampleButton = ({ query, onClick: onClickFromProps, ...buttonProps }: Props) => {
  const history = useHistory();
  return (
    <Button
      {...buttonProps}
      onClick={ev => {
        history.push(getSamplePageLink(query));
        onClickFromProps?.(ev);
      }}
    />
  );
};
