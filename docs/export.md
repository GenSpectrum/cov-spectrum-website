# Export buttons

Many things in Cov-Spectrum can be exported as embed links, PNG images or CSV files. The are all found under the "Export" button, but the code for them is actually split across different locations. Export buttons are usually shown by widgets (see [./widgets.md](./widgets.md)).

## Typical usage

You often want to have a widget with PNG export and embed support. By using `Widget.SharableComponent` (see [./widgets.md](./widgets.md)) you automatically get an export button with an "Embed widget" option. To add PNG export support, put a `DownloadWrapper` somewhere inside your widget, around the content that you want to be exported. You can also pass `csvData` to `DownloadWrapper`, which will automatically enable CSV export.

## Technical design

The mechanism for showing multiple actions in the "Export" dropdown is based on [React context](https://reactjs.org/docs/context.html). At the top of a subtree that can be exported (typically a `Widget.SharableComponent`) there is a `ExportManagerContext.Provider`. This provides a `ExportManager` object which is unique to this subtree. Anything that provides export functionality within this subtree (typically [src/charts/DownloadWrapper.tsx](/src/widgets/DownloadWrapper.tsx)) registers itself with `ExportManager.register()`. When an `ExportButton` within this subtree is clicked, it fetches the latest list of registered exporters to show in the dropdown. With this design, the location of the export code and the actual export button are independent.

## Export button without widget

Sometimes you want to have plot which is not embeddable, so it is not a widget and is not rendered by `Widget.SharableComponent`. In this case you wont have an "Export" and may see warnings like `register(...) called on ExportManager with warnOnUse`. To manually add an export button, you have to add both `ExportManagerContext.Provider` and `ExportButton`. Note that the `Provider` must be placed outside both the button and the plot. Also the `ExportManager` that you provide must be unique to the subtree. For examples see [src/components/WidgetWrapper.tsx](/src/components/WidgetWrapper.tsx) or the Swiss map in [src/pages/FocusPage.tsx](/src/pages/FocusPage.tsx).

## Extra export option

If you want something other than embeds, PNG export or CSV export, you can add a custom option to the export dropdown. To do this, get the `ExportManager` from `ExportManagerContext` (from a component within `ExportManagerContext.Provider`) and call `ExportManager.register` on it. Remember to call `DeregistrationHandle.deregister` to avoid "leaking" menu items. See [src/charts/DownloadWrapper.tsx](/src/widgets/DownloadWrapper.tsx) for an example.
