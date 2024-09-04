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

const sharedWidgetPropsEncoder = new AsyncZodQueryEncoder(
  SharedWidgetPropsSchema,
  async (v: SharedWidgetProps) => v,
  async v => v,
  'sharedWidgetJson'
);

type LabelledComponent<C> = { label: string; component: C };

export class Widget<
  E extends AsyncQueryEncoder<any>,
  P extends E['_decodedType'],
  C extends React.FunctionComponent<P>,
> {
  readonly ShareableComponent: React.FunctionComponent<P & WidgetWrapperExternalProps>;
  readonly mergedPropsEncoder: MergedAsyncQueryEncoder<{
    specific: E;
    shared: typeof sharedWidgetPropsEncoder;
  }>;

  DefaultComponent: C;

  constructor(
    public readonly specificPropsEncoder: E,
    public readonly Component: C | LabelledComponent<C>[],
    public readonly urlName: string
  ) {
    this.mergedPropsEncoder = new MergedAsyncQueryEncoder({
      specific: specificPropsEncoder,
      shared: sharedWidgetPropsEncoder,
    });
    this.DefaultComponent = Array.isArray(Component) ? Component[0].component : Component;
    const componentList: LabelledComponent<C>[] = [];
    let componentLabels: string[] | undefined = undefined;
    if (Array.isArray(Component)) {
      componentList.push(...Component);
      componentLabels = Component.map(c => c.label);
    } else {
      componentList.push({ label: 'singleComponent', component: Component });
    }
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
          componentLabels={componentLabels}
        >
          {componentList.map(labelledComponent => (
            <labelledComponent.component key={labelledComponent.label} {...componentProps} />
          ))}
        </WidgetWrapper>
      );
    };
  }
}

export type DecodedMergedWidgetProps = InstanceType<typeof Widget>['mergedPropsEncoder']['_decodedType'];
