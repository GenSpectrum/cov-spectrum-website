import React from 'react';
import { Button, ButtonProps } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { VariantSelector } from '../helpers/sample-selector';
import { getFocusPageLink } from '../pages/ExploreFocusSplit';
import { getGlobalSamplePageLink } from '../pages/GlobalSamplePage';
import { Country } from '../services/api-types';

interface Props extends ButtonProps {
  query: {
    variantSelector: VariantSelector;
    country: Country | undefined;
  };
}

export const LazySampleButton = ({
  query: { variantSelector, country },
  onClick: onClickFromProps,
  ...buttonProps
}: Props) => {
  const history = useHistory();
  return (
    <Button
      {...buttonProps}
      onClick={ev => {
        if (country) {
          history.push(getFocusPageLink(variantSelector, country, '/samples'));
        } else {
          history.push(getGlobalSamplePageLink(variantSelector));
        }
        onClickFromProps?.(ev);
      }}
    />
  );
};
