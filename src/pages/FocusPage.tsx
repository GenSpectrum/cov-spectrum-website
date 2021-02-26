import React from 'react';
import { VariantDashboard, Props as VariantDashboardProps } from '../components/VariantDashboard';
import {
  InternationalComparison,
  Props as InternationalComparisonProps,
} from '../components/InternationalComparison';

export type Props = VariantDashboardProps & InternationalComparisonProps;

export const FocusPage = (props: Props) => {
  return (
    <>
      <VariantDashboard {...props} />
      <hr />
      <InternationalComparison {...props} />
    </>
  );
};
