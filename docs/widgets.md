# Widgets

We have a special setup that allows individual plots to be loaded standalone. The user can get an embed link to show the plot in an IFrame. In the code these standalone plots (or tables, etc.) are called "widgets".

Widgets have a mechanism to serialize their props into a URL, so that the URL contains everything required to load the data. This means that you have to take care when passing props to widgets or loading data inside of them.

## Parts of widgets

Widgets consist of a React component, a "prop encoder", and a unique name. These things are wrapped into a `Widget` object. This `Widget` object can be used to render the widget with a share button. Widgets are centrally registered in [src/widgets/index.tsx](/src/widgets/index.tsx) so that they can be found by the embed page.

## Example of a widget

The "Sequences over time" plot has a widget `VariantTimeDistributionPlot` that is defined in [src/widgets/VariantTimeDistributionPlot.tsx](/src/widgets/VariantTimeDistributionPlot.tsx). This `Widget` object wraps the normal React component `VariantTimeDistributionPlot`, a prop encoder defined with `AsyncZodQueryEncoder` (described below), and the unique name `"VariantTimeDistributionPlot"`.

This widget is used in [src/pages/FocusPage.tsx](/src/pages/FocusPage.tsx) by using `VariantTimeDistributionPlotWidget.ShareableComponent` as a React component. Note that this renders `VariantTimeDistributionPlot`, but also a title, a card and a share button. This `SharableComponent` takes the props of `VariantTimeDistributionPlot`, but also some extra ones ("external" props, described below).

The widget is registered in [src/widgets/index.tsx](/src/widgets/index.tsx) so that the embed page works correctly.

## How props work with widgets

### Without embedding

This describes the situation when a widget is shown normally as part of our application (so _not_ standalone). The page containing the widget renders a `Widget.SharableComponent` and passes some props. These are the props that the inner React component expects, plus a few extra ("external props"). The external props are stripped away and the inner component is passed only the props that it expects. Nothing special is done with the values of the props that get passed through (for example reference equality is still preserved).

### When clicking "Share"

When the user clicks the share button of `Widget.SharableComponent`, the app creates an embed link that can be used to view this widget standalone. Since the widget will be standalone, this link must contain all the information necessary to show the right plot. This includes the unique name of the widget, but also some form of props.

Since our props contain large amounts of data, we can not serialize them directly (raw data as JSON) into the URL. We typically save something that describes the data used for the plot (e.g. country, variant and date range) instead of the actual data. These props that are safe to put in the URL are called _encoded_ props. The original props that the component received (with full data) are called _decoded_ props.

The prop encoder is the object that is responsible for converting between decoded and encoded props. It is one of parts of a `Widget` and is typically implemented using `AsyncZodQueryEncoder`. How this specific encoder works is described below.

### When viewing an embedded plot

When the user sees an IFrame with one of our embed links, our application loads [src/pages/EmbedPage.tsx](/src/pages/EmbedPage.tsx). This looks up the widget name from the URL in [src/widgets/index.tsx](/src/widgets/index.tsx). It then takes the prop encoder of that widget and uses it to convert the encoded props in the URL into decoded props. These are passed to the inner React component which actually renders the plot.

Note that even though the inner React component receives props of the correct type (just like without embedding) these props will not reference equal to the originals (since they have been freshly loaded). If there is a bug in your encoding or decoding logic, your widget might render differently (or crash) when being viewed through an embed link.

## `AsyncZodQueryEncoder`

The previous sections have only talked about the prop encoder of a widget in an abstract way. Concretely this prop encoder is almost always an `AsyncZodQueryEncoder`. In its minimal setup, this helper class will take all props and serialize them `JSON.stringify` into a query parameter in the URL. When the URL needs to be decoded, this helper class will perform `JSON.parse`, but then also validate that the resulting object actually matches the type of the props. `AsyncZodQueryEncoder` requires a Zod schema for this validation step (see "Validation" in [./api.md](./api.md) - that process is very similar).

This minimal setup is typically not what you need, since some of your props will contain full datasets that you don't want to put in the URL. For this reason `AsyncZodQueryEncoder` contains two functions: `encodeToInternal` and `decodeToInternal`. When serializing props to a URL the process is: `encodeToInternal`, strip fields using Zod schema, `JSON.stringify`, put JSON in a query parameter. When deserializing props from a URL the process is: take JSON out of the query parameter, `JSON.parse`, validate using Zod schema, `decodeFromInternal`.

Typically our `encodeToInternal` function will take a dataset from your props (the ones that the inner React component expects), pull our some description of the dataset (e.g. country, variant, etc.) and return that instead of the original prop. For any props that don't need special treatment (so props that aren't datasets), the `encodeToInternal` function must pass them along unchanged.

The `decodeToInternal` function will take any props that have not been directly saved (datasets) and will load them again using the information that was saved. This is why these functions are both `async`. As with `encodeToInternal`, any props that are not treated specially must be passed along.

Often your datasets will be `SampleSetWithSelector` objects. These are specially designed to work with widgets. See "Widgets and async loading" in [./sample-set.md](./sample-set.md) for more information. Take a look at [src/widgets/VariantTimeDistributionPlot.tsx](/src/widgets/VariantTimeDistributionPlot.tsx) for an example - it uses `AsyncZodQueryEncoder` with `SampleSetWithSelector`.

## "External" props

Some props can be passed to any `Widget.SharableComponent` (for example `title` or `toolbarChildren`). These are called (not very consistently) "external" props. They are defined in [src/components/WidgetWrapper.tsx](/src/components/WidgetWrapper.tsx) (`ExternalProps` and `externalPropsKeys`). These props are _not_ passed to the inner React component (plot) of a widget. They are stripped away and passed to `WidgetWrapper` instead. These props are generally only relevant for the component that uses a `Widget.SharableComponent`, not the component inside the `Widget` itself.

## Custom widget layout (cards, buttons)

Normally `Widget.SharableComponent` will be rendered as a card with a title and a share button. In some cases you don't want a card, or want to tweak some other part of the layout. This can be done by passing `widgetLayout` to `Widget.SharableComponent` (this in an "external" prop, see above). `NamedCard` (default), `NamedWidget` and `MinimalWidgetLayout` are existing layout components that you can use. You can also create your own layout components. If you just want to add an extra button next to "Share", you should pass `toolbarChildren` to `Widget.SharableComponent` instead of creating a custom layout.
