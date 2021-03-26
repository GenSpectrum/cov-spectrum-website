import React from 'react';
import {
  WidgetWrapper,
  ExternalProps as WidgetWrapperExternalProps,
  pickExternalProps,
} from '../components/WidgetWrapper';
import { AsyncQueryEncoder, QueryEncoder } from '../helpers/query-encoder';

export class Widget<
  E extends QueryEncoder<any>,
  P extends E['_decodedType'],
  C extends React.FunctionComponent<P>
> {
  readonly ShareableComponent: React.FunctionComponent<P & WidgetWrapperExternalProps>;

  constructor(
    public readonly propsEncoder: E,
    public readonly Component: C,
    public readonly urlName: string
  ) {
    this.ShareableComponent = props => {
      const { external: wrapperProps, remaining: componentProps } = pickExternalProps<P>(props);
      return (
        <WidgetWrapper
          {...wrapperProps}
          getShareUrl={async () => `${this.urlName}?${this.propsEncoder.encode(props)}`}
        >
          <this.Component {...componentProps} />
        </WidgetWrapper>
      );
    };
  }
}

export class NewWidget<
  E extends AsyncQueryEncoder<any>,
  P extends E['_decodedType'],
  C extends React.FunctionComponent<P>
> {
  readonly ShareableComponent: React.FunctionComponent<P & WidgetWrapperExternalProps>;

  constructor(
    public readonly propsEncoder: E,
    public readonly Component: C,
    public readonly urlName: string
  ) {
    this.ShareableComponent = props => {
      const { external: wrapperProps, remaining: componentProps } = pickExternalProps<P>(props);
      return (
        <WidgetWrapper
          {...wrapperProps}
          getShareUrl={async () => `${this.urlName}?${await this.propsEncoder.encode(props)}`}
        >
          <this.Component {...componentProps} />
        </WidgetWrapper>
      );
    };
  }
}
