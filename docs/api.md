# API

CoV-Spectrum uses a REST API. The API itself is [documented here](https://github.com/cevo-public/cov-spectrum-docs/blob/develop/API.md). The frontend code makes requests to this API through helper functions in [src/services/api.ts](/src/services/api.ts).

## Validation

The data structures used by the API are written in [src/services/api-types.ts](/src/services/api-types.ts) in a format that allows them to be used nicely with TypeScript. Specifically this approach gives us types that are used throughout most of the app, and checks that responses received from the server match these types. That way if the server gives an unexpected response, the code will immediately throw a clear exception, instead of causing confusing bugs in later code when data does not have the expected shape.

The library we use for writing types that we can validate at runtime is [Zod](https://github.com/colinhacks/zod/tree/v3). This library has [bad performance](https://github.com/moltar/typescript-runtime-type-benchmarks), so for a few endpoints which returns lots of data we **don't perform validation**. We should replace [Zod](https://github.com/cevo-public/cov-spectrum-website/issues/79) by something faster in the future.

## Authentication

Most API data is public and does not require an API key. See the [API doc](https://github.com/cevo-public/cov-spectrum-docs/blob/develop/API.md) for info about what does require a key ("private").

The helper functions in [src/services/api.ts](/src/services/api.ts) automatically attach an API if the user is logged in. In your code you may want to hide things or show warnings if a user isn't logged in. For this you can use `AccountService.isLoggedIn()`. Note that you don't have to listen for updates about the login state, since the application is fully reloaded after login and logout.

## `getNewSamples` endpoint

This endpoint (`/resource/sample2` in REST) is a little special compared to most other endpoints. It can be used to create many different plots. There is a separate documentation page ([./sample-set.md](./sample-set.md)) about this and the related `SampleSet` class.
