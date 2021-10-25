# Routing

This app uses [React router](https://reactrouter.com/) mostly in a typical way. There are a few cases where URL handling is special.

## `useQuery`

[src/helpers/query-hook.ts](/src/helpers/query-hook.ts) contains the `useQuery()` that helps us manage the states of data fetching.

## Embed URLs

When widgets are shared and embedded, their props are encoded in URLs - see [./widgets.md](./widgets.md) for information about those URLs.

## `useExploreUrl` and `getFocusPageLink`

The central part of the application shows information about a specific SARS-CoV-2 variant. The selected variant and other filters (e.g. country) are stored in the URL.

Decoding or modifying these URLs can get relatively complicated. The `useExploreUrl` hook from [src/helpers/explore-url.ts](/src/helpers/explore-url.ts) handles this correctly for you.

To link to most pages in the application, the URL has to contain all of this information (e.g. variant selector). You should use one of the functions returned by `useExploreUrl` (e.g., `getDeepExplorePageUrl`) to navigate or to obtain the correct path.
