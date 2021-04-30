import React from 'react';
import {
  ExternalProps as WidgetWrapperExternalProps,
  pickExternalProps,
  WidgetWrapper,
} from '../components/WidgetWrapper';
import { AsyncQueryEncoder, AsyncZodQueryEncoder, MergedAsyncQueryEncoder } from '../helpers/query-encoder';
import * as zod from 'zod';

const SharedWidgetPropsSchema = zod.object({
  originalPageUrl: zod.string().optional(),
});

type SharedWidgetProps = zod.infer<typeof SharedWidgetPropsSchema>;

class SharedWidgetPropsEncoder implements AsyncQueryEncoder<SharedWidgetProps> {
  _decodedType!: SharedWidgetProps;

  private baseEncoder = new AsyncZodQueryEncoder(
    SharedWidgetPropsSchema,
    async (v: SharedWidgetProps) => v,
    async v => v,
    'sharedWidgetJson'
  );

  async encode(decoded: SharedWidgetProps): Promise<URLSearchParams> {
    return this.baseEncoder.encode(decoded);
  }

  async decode(encoded: URLSearchParams): Promise<SharedWidgetProps> {
    try {
      return await this.baseEncoder.decode(encoded);
    } catch (err) {
      console.warn(
        'SharedWidgetPropsEncoder.baseEncoder failed (falling back to empty SharedWidgetProps)',
        err
      );
      return {};
    }
  }
}

export class Widget<
  E extends AsyncQueryEncoder<any>,
  P extends E['_decodedType'],
  C extends React.FunctionComponent<P>
> {
  readonly ShareableComponent: React.FunctionComponent<P & WidgetWrapperExternalProps>;
  readonly mergedPropsEncoder: MergedAsyncQueryEncoder<{
    specific: E;
    shared: InstanceType<typeof SharedWidgetPropsEncoder>;
  }>;

  constructor(
    public readonly specificPropsEncoder: E,
    public readonly Component: C,
    public readonly urlName: string
  ) {
    this.mergedPropsEncoder = new MergedAsyncQueryEncoder({
      specific: specificPropsEncoder,
      shared: new SharedWidgetPropsEncoder(),
    });
    this.ShareableComponent = props => {
      const { external: wrapperProps, remaining: componentProps } = pickExternalProps<P>(props);
      return (
        <WidgetWrapper
          {...wrapperProps}
          getShareUrl={async () =>
            `${this.urlName}?${await this.mergedPropsEncoder.encode({
              specific: props,
              shared: { originalPageUrl: window.location.href },
            })}`
          }
        >
          <this.Component {...componentProps} />
        </WidgetWrapper>
      );
    };
  }
}

export type DecodedMergedWidgetProps = InstanceType<typeof Widget>['mergedPropsEncoder']['_decodedType'];
