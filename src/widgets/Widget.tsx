import React from 'react';
import { WidgetWrapper } from '../components/WidgetWrapper';
import { QueryEncoder } from '../helpers/query-encoder';

export class Widget<
  E extends QueryEncoder<any>,
  P extends E['_decodedType'],
  C extends React.FunctionComponent<P>
> {
  readonly ShareableComponent: React.FunctionComponent<P>;

  constructor(
    public readonly propsEncoder: E,
    public readonly Component: C,
    public readonly urlName: string
  ) {
    this.ShareableComponent = (props: P) => (
      <WidgetWrapper shareUrl={`${this.urlName}?${this.propsEncoder.encode(props)}`}>
        <this.Component {...props} />
      </WidgetWrapper>
    );
  }
}
