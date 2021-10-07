import React from 'react';
import { Button, ButtonProps } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { getFocusPageLink } from '../helpers/explore-url';
import { VariantSelector } from '../helpers/sample-selector';
import { getGlobalSamplePageLink } from '../pages/GlobalSamplePage';
import { SamplingStrategy } from '../services/api';
import { Country, DateRange } from '../services/api-types';

interface Props extends ButtonProps {
  query: {
    variantSelector: VariantSelector;
    samplingStrategy: SamplingStrategy;
    country: Country | undefined;
    dateRange: DateRange;
  };
}

export const LazySampleButton = ({
  query: { variantSelector, country, samplingStrategy, dateRange },
  onClick: onClickFromProps,
  ...buttonProps
}: Props) => {
  const history = useHistory();
  return (
    <Button
      {...buttonProps}
      onClick={ev => {
        if (country) {
          history.push(
            getFocusPageLink({
              variantSelector,
              country,
              samplingStrategy,
              dateRange,
              deepFocusPath: '/samples',
            })
          );
        } else {
          history.push(getGlobalSamplePageLink(variantSelector));
        }
        onClickFromProps?.(ev);
      }}
    />
  );
};
