import { TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import React, { useEffect } from 'react';
import { Payload } from 'recharts/types/component/DefaultTooltipContent';

export function SetCurrentDataSideEffect<Data>({
  tooltipProps,
  setCurrentData,
}: {
  tooltipProps: TooltipProps<ValueType, NameType>;
  setCurrentData: (data: Data) => void;
}) {
  return (
    <TooltipSideEffect
      tooltipProps={tooltipProps}
      sideEffect={tooltipProps => {
        if (tooltipProps?.payload?.length === undefined || tooltipProps.payload.length > 0) {
          setCurrentData((tooltipProps.payload as Payload<any, any>[])[0].payload);
        }
      }}
    />
  );
}

export function TooltipSideEffect({
  tooltipProps,
  sideEffect,
}: {
  tooltipProps: TooltipProps<ValueType, NameType>;
  sideEffect: (data: TooltipProps<ValueType, NameType>) => void;
}) {
  useEffect(() => {
    sideEffect(tooltipProps);
  }, [tooltipProps, sideEffect]);
  return null;
}
